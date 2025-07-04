import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for working with Supabase data

// Products
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      main_category_data:categories!products_main_category_fkey(id, name, slug),
      sub_category_data:categories!products_sub_category_fkey(id, name, slug)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      main_category_data:categories!products_main_category_fkey(id, name, slug),
      sub_category_data:categories!products_sub_category_fkey(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

export async function createProduct(product: any) {
  try {
    // Validate required fields
    if (!product.name) {
      console.error('Error creating product: Missing required field "name"');
      return null;
    }

    // Handle numeric fields
    const cleanedProduct = {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      price_min: typeof product.price_min === 'string' ? parseFloat(product.price_min) : product.price_min,
      price_max: typeof product.price_max === 'string' ? parseFloat(product.price_max) : product.price_max,
      moq: product.moq ? (typeof product.moq === 'string' ? parseFloat(product.moq) : product.moq) : null,
      // Ensure display_image and hover_image are explicitly present or null
      display_image: product.display_image || null,
      hover_image: product.hover_image || null
    };

    console.log('Creating product with data:', JSON.stringify(cleanedProduct));

    const { data, error } = await supabase
      .from('products')
      .insert(cleanedProduct)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error.message, error.details, error.hint);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception while creating product:', err);
    return null;
  }
}

export async function updateProduct(id: string, product: any) {
  try {
    // Validate ID
    if (!id) {
      console.error('Error updating product: Missing product ID');
      return null;
    }

    // Handle numeric fields
    const cleanedProduct = {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      price_min: typeof product.price_min === 'string' ? parseFloat(product.price_min) : product.price_min,
      price_max: typeof product.price_max === 'string' ? parseFloat(product.price_max) : product.price_max,
      moq: product.moq ? (typeof product.moq === 'string' ? parseFloat(product.moq) : product.moq) : null,
      // Ensure display_image and hover_image are properly handled
      display_image: 'display_image' in product ? product.display_image : undefined,
      hover_image: 'hover_image' in product ? product.hover_image : undefined
    };

    console.log('Updating product with data:', JSON.stringify(cleanedProduct));

    const { data, error } = await supabase
      .from('products')
      .update(cleanedProduct)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error.message, error.details, error.hint);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception while updating product:', err);
    return null;
  }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }

  return true;
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

export async function createCategory(category: any) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }

  return data;
}

export async function updateCategory(id: string, category: any) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return null;
  }

  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }

  return true;
}

// Quote Requests
export async function getQuoteRequests() {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quote requests:', error);
    return [];
  }

  return data;
}

export async function getQuoteRequestById(id: string) {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quote request:', error);
    return null;
  }

  // Enhance the shortlisted products with full product data if needed
  if (data && data.shortlisted_products && Array.isArray(data.shortlisted_products)) {
    // The data is already structured correctly with product details embedded
    // This structure allows for compatibility with both string IDs and object formats
    return data;
  }

  return data;
}

export async function getQuoteProductDetails(quoteData: any) {
  // This is a helper function to get full product details for a quote's shortlisted products
  if (!quoteData?.shortlisted_products || !Array.isArray(quoteData.shortlisted_products)) {
    return [];
  }

  // Extract product IDs from the shortlisted products
  const productIds = quoteData.shortlisted_products.map((item: any) => 
    typeof item === 'string' ? item : item.id
  ).filter(Boolean);
  
  if (productIds.length === 0) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      main_category_data:categories!products_main_category_fkey(id, name, slug),
      sub_category_data:categories!products_sub_category_fkey(id, name, slug)
    `)
    .in('id', productIds);

  if (error) {
    console.error('Error fetching quote product details:', error);
    return [];
  }

  return data;
}

export async function updateQuoteRequestStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quote request status:', error);
    return null;
  }

  return data;
}

// Testimonials
export async function getTestimonials() {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data;
}

export async function getTestimonialById(id: string) {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching testimonial:', error);
    return null;
  }

  return data;
}

export async function createTestimonial(testimonial: any) {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(testimonial)
    .select()
    .single();

  if (error) {
    console.error('Error creating testimonial:', error);
    return null;
  }

  return data;
}

export async function updateTestimonial(id: string, testimonial: any) {
  const { data, error } = await supabase
    .from('testimonials')
    .update(testimonial)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating testimonial:', error);
    return null;
  }

  return data;
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting testimonial:', error);
    return false;
  }

  return true;
}

// Blog
export async function getBlogCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }

  return data;
}

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name)')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data;
}

export async function getBlogPostById(id: number) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

export async function createBlogPost(post: any) {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    return null;
  }

  return data;
}

export async function updateBlogPost(id: number, post: any) {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    return null;
  }

  return data;
}

export async function deleteBlogPost(id: number) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }

  return true;
} 