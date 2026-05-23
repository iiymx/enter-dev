import { createClient } from '@supabase/supabase-js';

// Cache for active client instance
let supabaseInstance = null;

/**
 * Gets active Supabase credentials from either environment variables
 * or local storage configuration.
 */
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem('enter_supabase_url');
  const localKey = localStorage.getItem('enter_supabase_anon_key');
  const isCloudEnabled = localStorage.getItem('enter_cloud_enabled') === 'true';

  // If local settings are set and cloud is enabled, prioritize local settings.
  // Otherwise, fallback to environment variables if present.
  if (isCloudEnabled && localUrl && localKey) {
    return { url: localUrl.trim(), key: localKey.trim(), source: 'local' };
  } else if (envUrl && envKey) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }

  return null;
}

/**
 * Retrieves or instantiates the Supabase client.
 */
export function getSupabaseClient() {
  const creds = getSupabaseCredentials();
  if (!creds) return null;

  // If instance is already created with same credentials, return cached instance
  if (supabaseInstance && supabaseInstance.supabaseUrl === creds.url) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(creds.url, creds.key, {
      auth: {
        persistSession: false // No complex login state required for client-side CMS keys
      }
    });
    // Store url on the instance to check against future configurations
    supabaseInstance.supabaseUrl = creds.url;
    return supabaseInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

/**
 * Checks if Supabase integration is currently active and configured.
 */
export function isSupabaseActive() {
  return getSupabaseClient() !== null;
}

/**
 * Tests connection to a Supabase project by querying the database.
 */
export async function testSupabaseConnection(url, key) {
  try {
    const tempClient = createClient(url, key, { auth: { persistSession: false } });
    
    // Quick probe to projects table
    const { data, error } = await tempClient
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist, connection itself is working, but schema is missing
      if (error.code === 'PGRST116' || error.message.includes('relation "public.projects" does not exist')) {
        return { success: true, warning: 'schema_missing', message: 'تم الاتصال بنجاح، ولكن جدول "projects" غير موجود في قاعدة البيانات.' };
      }
      throw error;
    }

    return { success: true, message: 'تم الاتصال بقاعدة البيانات بنجاح!' };
  } catch (error) {
    console.error("Supabase test connection failed:", error);
    return { success: false, message: error.message || 'فشل الاتصال! يرجى التحقق من المفاتيح أو حالة الاتصال.' };
  }
}

/**
 * Fetches all projects from the database, ordered by order_index.
 */
export async function fetchCloudProjects() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    
    // Map database fields to application model
    return data.map(item => ({
      id: item.id,
      title: item.title,
      desc: item.desc,
      category: item.category,
      url: item.url || '',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',') : []),
      image: item.image || '',
      bgClass: item.bgClass || 'project-5-bg',
      order_index: item.order_index || 0
    }));
  } catch (error) {
    console.error("Error fetching projects from Supabase:", error);
    throw error;
  }
}

/**
 * Inserts a new project into the database.
 */
export async function insertCloudProject(project, index = 0) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const newRecord = {
      title: project.title,
      desc: project.desc,
      category: project.category,
      url: project.url || '',
      tags: project.tags,
      image: project.image || '',
      bgClass: project.bgClass || 'project-5-bg',
      order_index: index
    };

    const { data, error } = await client
      .from('projects')
      .insert([newRecord])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error inserting project to Supabase:", error);
    throw error;
  }
}

/**
 * Updates an existing project in the database.
 */
export async function updateCloudProject(project) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const updatedRecord = {
      title: project.title,
      desc: project.desc,
      category: project.category,
      url: project.url || '',
      tags: project.tags,
      image: project.image || '',
      bgClass: project.bgClass || 'project-5-bg',
      order_index: project.order_index || 0
    };

    const { data, error } = await client
      .from('projects')
      .update(updatedRecord)
      .eq('id', project.id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Error updating project in Supabase:", error);
    throw error;
  }
}

/**
 * Deletes a project from the database.
 */
export async function deleteCloudProject(id) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { error } = await client
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting project from Supabase:", error);
    throw error;
  }
}

/**
 * Syncs multiple projects at once (useful for re-ordering or bulk syncing).
 */
export async function syncProjectsOrder(projects) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Perform individual updates for order indices
    const promises = projects.map((proj, idx) => {
      return client
        .from('projects')
        .update({ order_index: idx })
        .eq('id', proj.id);
    });

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error syncing project ordering to Supabase:", error);
    throw error;
  }
}

/**
 * Uploads a file to the "project-images" public bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadCloudImage(file) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload direct binary to "project-images" bucket
    const { data, error } = await client.storage
      .from('project-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from('project-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase Storage:", error);
    throw error;
  }
}

/**
 * Performs a bulk migration of all local storage projects into the Supabase database.
 */
export async function bulkMigrateLocalToCloud(localProjects) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Fetch current cloud projects to avoid direct duplicate inserts, or we can clear/bulk-insert.
    // To ensure full clean overwrite matching the user's intent, let's delete all existing and insert new:
    const confirmBackup = confirm("سيؤدي ذلك إلى حذف المشاريع الحالية في قاعدة البيانات السحابية واستبدالها بالنسخة المحلية بالكامل. هل تريد المتابعة؟");
    if (!confirmBackup) return false;

    // Delete existing cloud entries
    const { error: deleteError } = await client
      .from('projects')
      .delete()
      .neq('id', 0); // Delete all rows where id exists (standard Postgres deletion)

    if (deleteError) throw deleteError;

    // Build insert payloads
    const insertPayload = localProjects.map((proj, idx) => ({
      title: proj.title,
      desc: proj.desc,
      category: proj.category,
      url: proj.url || '',
      tags: proj.tags,
      image: proj.image || '',
      bgClass: proj.bgClass || 'project-5-bg',
      order_index: idx
    }));

    if (insertPayload.length > 0) {
      const { error: insertError } = await client
        .from('projects')
        .insert(insertPayload);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error("Error performing bulk migration to cloud:", error);
    throw error;
  }
}
