import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdboziaqvnpkjxyfbndv.supabase.co';
const supabaseKey = 'sb_publishable_KnM2c78mu3gbBfPGg2q0ng_9Dg7vIx1';

const supabase = createClient(supabaseUrl, supabaseKey);

// Real delivery zones for a food delivery service
const zones = [
  {
    name: 'Downtown Core',
    description: 'Central business district with high-density offices and restaurants',
    center_lat: 40.7580,
    center_lng: -73.9855,
    radius_km: 3.5,
    color: '#7a3dff',
    is_active: true,
  },
  {
    name: 'Brooklyn Heights',
    description: 'Historic residential neighborhood with waterfront views',
    center_lat: 40.6953,
    center_lng: -73.9934,
    radius_km: 2.8,
    color: '#00d722',
    is_active: true,
  },
  {
    name: 'Upper East Side',
    description: 'Affluent residential area with luxury apartments and boutiques',
    center_lat: 40.7736,
    center_lng: -73.9566,
    radius_km: 3.2,
    color: '#ff6b35',
    is_active: true,
  },
  {
    name: 'Williamsburg',
    description: 'Trendy neighborhood with vibrant food scene and nightlife',
    center_lat: 40.7081,
    center_lng: -73.9571,
    radius_km: 2.5,
    color: '#ffbe0b',
    is_active: true,
  },
  {
    name: 'Long Island City',
    description: 'Rapidly developing waterfront district with modern high-rises',
    center_lat: 40.7447,
    center_lng: -73.9485,
    radius_km: 3.0,
    color: '#3a86ff',
    is_active: false,
  },
];

// Real products for a food delivery catalog
const products = [
  {
    name: 'Margherita Pizza',
    description: 'Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil',
    price: 18.99,
    stock_quantity: 50,
    category: 'Italian',
    image_url: null,
    zone_ids: [], // Will be set after zones are created
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in creamy tomato-based curry with aromatic spices, served with basmati rice',
    price: 22.50,
    stock_quantity: 35,
    category: 'Indian',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Salmon Poke Bowl',
    description: 'Fresh sashimi-grade salmon, sushi rice, avocado, edamame, cucumber, sesame seeds, and ponzu sauce',
    price: 24.99,
    stock_quantity: 25,
    category: 'Japanese',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Beef Burger with Fries',
    description: 'Angus beef patty, aged cheddar, lettuce, tomato, onion, pickles, and house sauce on brioche bun',
    price: 16.99,
    stock_quantity: 60,
    category: 'American',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Pad Thai',
    description: 'Stir-fried rice noodles with shrimp, tofu, bean sprouts, egg, peanuts, and tamarind sauce',
    price: 19.50,
    stock_quantity: 40,
    category: 'Thai',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan crisps, house-made croutons, and classic Caesar dressing',
    price: 13.99,
    stock_quantity: 45,
    category: 'Salads',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Lamb Gyro Platter',
    description: 'Marinated lamb, warm pita, tzatziki, tomatoes, onions, and Greek fries',
    price: 21.99,
    stock_quantity: 30,
    category: 'Mediterranean',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Miso Ramen',
    description: 'Rich miso broth, chashu pork, soft-boiled egg, corn, bamboo shoots, and scallions',
    price: 20.00,
    stock_quantity: 28,
    category: 'Japanese',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Veggie Burrito Bowl',
    description: 'Cilantro-lime rice, black beans, roasted vegetables, guacamole, salsa, and queso fresco',
    price: 15.99,
    stock_quantity: 55,
    category: 'Mexican',
    image_url: null,
    zone_ids: [],
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla bean ice cream, and berry compote',
    price: 9.99,
    stock_quantity: 40,
    category: 'Desserts',
    image_url: null,
    zone_ids: [],
  },
];

// Real sample orders
const orders = [
  {
    customer_name: 'Sarah Mitchell',
    customer_email: 'sarah.mitchell@email.com',
    customer_phone: '+1-555-0142',
    customer_address: '120 Broadway, New York, NY 10271',
    delivery_lat: 40.7128,
    delivery_lng: -74.0060,
    status: 'delivered',
    total_amount: 43.48,
    distance_km: 1.2,
    notes: 'Leave at front desk',
    items: [
      { product_name: 'Margherita Pizza', unit_price: 18.99, quantity: 1, subtotal: 18.99 },
      { product_name: 'Caesar Salad', unit_price: 13.99, quantity: 1, subtotal: 13.99 },
      { product_name: 'Chocolate Lava Cake', unit_price: 9.99, quantity: 1, subtotal: 9.99 },
    ],
  },
  {
    customer_name: 'James Chen',
    customer_email: 'j.chen@techstartup.io',
    customer_phone: '+1-555-0287',
    customer_address: '45 Main St, Brooklyn, NY 11201',
    delivery_lat: 40.6953,
    delivery_lng: -73.9934,
    status: 'out_for_delivery',
    total_amount: 47.49,
    distance_km: 0.8,
    notes: 'Call when arriving',
    items: [
      { product_name: 'Chicken Tikka Masala', unit_price: 22.50, quantity: 1, subtotal: 22.50 },
      { product_name: 'Miso Ramen', unit_price: 20.00, quantity: 1, subtotal: 20.00 },
    ],
  },
  {
    customer_name: 'Emily Rodriguez',
    customer_email: 'emily.r@designstudio.com',
    customer_phone: '+1-555-0391',
    customer_address: '200 E 72nd St, New York, NY 10021',
    delivery_lat: 40.7736,
    delivery_lng: -73.9566,
    status: 'confirmed',
    total_amount: 39.98,
    distance_km: 2.1,
    notes: 'Ring doorbell twice',
    items: [
      { product_name: 'Salmon Poke Bowl', unit_price: 24.99, quantity: 1, subtotal: 24.99 },
      { product_name: 'Veggie Burrito Bowl', unit_price: 15.99, quantity: 1, subtotal: 15.99 },
    ],
  },
  {
    customer_name: 'Michael Thompson',
    customer_email: 'm.thompson@freelance.dev',
    customer_phone: '+1-555-0456',
    customer_address: '85 N 3rd St, Brooklyn, NY 11249',
    delivery_lat: 40.7081,
    delivery_lng: -73.9571,
    status: 'pending',
    total_amount: 38.98,
    distance_km: 1.5,
    notes: 'Vegetarian only',
    items: [
      { product_name: 'Pad Thai', unit_price: 19.50, quantity: 1, subtotal: 19.50 },
      { product_name: 'Veggie Burrito Bowl', unit_price: 15.99, quantity: 1, subtotal: 15.99 },
    ],
  },
  {
    customer_name: 'Lisa Park',
    customer_email: 'lisa.park@marketing.agency',
    customer_phone: '+1-555-0523',
    customer_address: '5-46 46th Ave, Long Island City, NY 11101',
    delivery_lat: 40.7447,
    delivery_lng: -73.9485,
    status: 'cancelled',
    total_amount: 31.98,
    distance_km: 0.5,
    notes: 'Customer cancelled - duplicate order',
    items: [
      { product_name: 'Beef Burger with Fries', unit_price: 16.99, quantity: 1, subtotal: 16.99 },
      { product_name: 'Caesar Salad', unit_price: 13.99, quantity: 1, subtotal: 13.99 },
    ],
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Clear existing data (optional - uncomment if you want fresh data)
  // await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // await supabase.from('product_zones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // await supabase.from('delivery_zones').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Insert zones
  console.log('📍 Inserting delivery zones...');
  const { data: insertedZones, error: zonesError } = await supabase
    .from('delivery_zones')
    .insert(zones)
    .select();

  if (zonesError) {
    console.error('❌ Error inserting zones:', zonesError.message);
    return;
  }
  console.log(`✅ Inserted ${insertedZones.length} zones\n`);

  // 3. Insert products
  console.log('🍕 Inserting products...');
  const productsToInsert = products.map(p => ({
    name: p.name,
    description: p.description,
    price: p.price,
    stock_quantity: p.stock_quantity,
    category: p.category,
    image_url: p.image_url,
  }));

  const { data: insertedProducts, error: productsError } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select();

  if (productsError) {
    console.error('❌ Error inserting products:', productsError.message);
    return;
  }
  console.log(`✅ Inserted ${insertedProducts.length} products\n`);

  // 4. Link products to zones (assign all products to all active zones)
  console.log('🔗 Linking products to zones...');
  const activeZones = insertedZones.filter(z => z.is_active);
  const productZoneLinks = [];
  
  for (const product of insertedProducts) {
    for (const zone of activeZones) {
      productZoneLinks.push({
        product_id: product.id,
        zone_id: zone.id,
      });
    }
  }

  const { error: linksError } = await supabase
    .from('product_zones')
    .insert(productZoneLinks);

  if (linksError) {
    console.error('❌ Error linking products to zones:', linksError.message);
    return;
  }
  console.log(`✅ Linked ${productZoneLinks.length} product-zone relationships\n`);

  // 5. Insert orders with items
  console.log('📦 Inserting orders...');
  let totalItems = 0;

  for (const order of orders) {
    // Find zone for this order's location
    const zone = insertedZones.find(z => 
      z.is_active && 
      Math.abs(z.center_lat - order.delivery_lat) < 0.1 && 
      Math.abs(z.center_lng - order.delivery_lng) < 0.1
    );

    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        delivery_lat: order.delivery_lat,
        delivery_lng: order.delivery_lng,
        zone_id: zone?.id || null,
        status: order.status,
        total_amount: order.total_amount,
        distance_km: order.distance_km,
        notes: order.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error(`❌ Error inserting order for ${order.customer_name}:`, orderError.message);
      continue;
    }

    // Insert order items
    const orderItems = order.items.map(item => ({
      order_id: insertedOrder.id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error(`❌ Error inserting items for order ${insertedOrder.id}:`, itemsError.message);
    } else {
      totalItems += orderItems.length;
      console.log(`  ✅ Order for ${order.customer_name} (${order.status}) - ${orderItems.length} items`);
    }
  }

  console.log(`\n✅ Inserted ${orders.length} orders with ${totalItems} total items\n`);

  // 6. Verify data
  console.log('🔍 Verifying seeded data...');
  const { data: verifyZones } = await supabase.from('delivery_zones').select('*');
  const { data: verifyProducts } = await supabase.from('products').select('*');
  const { data: verifyOrders } = await supabase.from('orders').select('*, order_items(*)');

  console.log(`\n📊 Database Summary:`);
  console.log(`   Zones: ${verifyZones?.length || 0}`);
  console.log(`   Products: ${verifyProducts?.length || 0}`);
  console.log(`   Orders: ${verifyOrders?.length || 0}`);
  console.log(`   Order Items: ${verifyOrders?.reduce((sum, o) => sum + (o.order_items?.length || 0), 0) || 0}`);

  console.log('\n🎉 Seeding complete! The app will now load real data from Supabase.');
}

seedDatabase().catch(console.error);