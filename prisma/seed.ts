import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clear existing data ─────────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();

  // ─── Menu Categories & Items ─────────────────────────────────────────────
  const categories = [
    {
      id: 'cat-1',
      name: 'Entradas',
      type: 'ENTRADAS',
      sortOrder: 1,
      items: [
        { id: '1', name: 'Rollitos primavera', description: 'Crujientes rollos rellenos de vegetales', price: 12000, image: 'https://i.blogs.es/40e6e2/rollitos_primavera/840_560.jpg' },
        { id: '2', name: 'Gyozas de cerdo', description: 'Empanadillas japonesas a la plancha', price: 15000, image: 'https://jetextramar.com/wp-content/uploads/2022/07/receta-de-gyozas-de-cerdo.jpg' },
        { id: '3', name: 'Edamame', description: 'Vainas de soya al vapor con sal marina', price: 10000, image: 'https://images.services.kitchenstories.io/P35ZhSf7mNJW3ntmAmX57XxtMEM=/3840x0/filters:quality(80)/images.kitchenstories.io/wagtailOriginalImages/R2958-final-photo-.jpg' },
        { id: '4', name: 'Bao buns', description: 'Pan al vapor relleno de cerdo o pollo', price: 16000, image: 'https://eatlittlebird.com/wp-content/uploads/2022/09/korean-fried-chicken-bao-buns-5.jpg' },
      ],
    },
    {
      id: 'cat-2',
      name: 'Sushi y Sashimi',
      type: 'SUSHI',
      sortOrder: 2,
      items: [
        { id: '5', name: 'California Roll', description: 'Cangrejo, aguacate y pepino', price: 18000, image: 'https://www.mashed.com/img/gallery/easy-california-roll-recipe/l-intro-1656513015.jpg' },
        { id: '6', name: 'Dragon Roll', description: 'Anguila, aguacate y salsa dulce', price: 24000, image: 'https://thesushiman.com/wp-content/uploads/2025/01/Dragon-Roll-1-scaled.jpg' },
        { id: '7', name: 'Philadelphia Roll', description: 'Salmón, queso crema y aguacate', price: 20000, image: 'https://thesushiman.com/wp-content/uploads/2025/01/Philadelphia-Roll-Edited2-scaled.jpg' },
        { id: '8', name: 'Sashimi de salmón', description: 'Cortes frescos de salmón', price: 26000, image: 'https://imag.bonviveur.com/presentacion-principal-del-sashimi-de-salmon.jpg' },
      ],
    },
    {
      id: 'cat-3',
      name: 'Sopas',
      type: 'SOPAS',
      sortOrder: 3,
      items: [
        { id: '9', name: 'Ramen de cerdo', description: 'Caldo intenso con fideos, cerdo y huevo', price: 28000, image: 'https://www.lanacion.com.ar/resizer/v2/a-shoyu-ramen-in-gray-bowl-on-concrete-table-top-3CCBARMPDRFI5O6H5OPS3PP66E.jpg?auth=5f4d38a8750849d33b7c6e6cd4aec32bcd639658006140e82c66d27189a3ca47&width=420&height=280&quality=70&smart=true' },
        { id: '10', name: 'Sopa miso', description: 'Caldo ligero con tofu, algas y cebollín', price: 12000, image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/5509FCCF-6EB8-418B-99CF-D7EF5567682D/Derivates/0A82C349-F495-47C3-BDE2-E805C70F137E.jpg' },
        { id: '11', name: 'Udon', description: 'Fideos gruesos en caldo caliente', price: 22000, image: 'https://asianorigins.es/recetas/wp-content/uploads/2024/08/YAKI-UDON-CON-CERDO-Y-VERDURAS-FOTO-4-scaled.jpeg' },
      ],
    },
    {
      id: 'cat-4',
      name: 'Platos fuertes',
      type: 'PLATOS',
      sortOrder: 4,
      items: [
        { id: '12', name: 'Arroz frito', description: 'Arroz salteado con vegetales y proteína', price: 18000, image: 'https://i.blogs.es/8424ac/arroz-frito-chino/1200_900.jpg' },
        { id: '13', name: 'Pollo teriyaki', description: 'Pollo a la parrilla con salsa teriyaki', price: 26000, image: 'https://imag.bonviveur.com/pollo-en-salsa-teriyaki.jpg' },
        { id: '14', name: 'Pad Thai', description: 'Fideos de arroz salteados estilo tailandés', price: 27000, image: 'https://thai-foodie.com/wp-content/uploads/2025/08/plated-gluten-free-pad-thai.jpg' },
        { id: '15', name: 'Bowl de salmón', description: 'Salmón, arroz y vegetales frescos', price: 30000, image: 'https://imag.bonviveur.com/poke-bowl-de-salmon-recien-hecho.jpg' },
      ],
    },
    {
      id: 'cat-5',
      name: 'Tempura',
      type: 'TEMPURA',
      sortOrder: 5,
      items: [
        { id: '16', name: 'Camarones tempura', description: 'Camarones rebozados y crujientes', price: 26000, image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/33A50401-D4DA-452F-AD42-DC47F8E7C567/Derivates/77b9a339-6aa3-4454-8277-15f674dc63c3.jpg' },
        { id: '17', name: 'Vegetales tempura', description: 'Verduras fritas en masa ligera', price: 18000, image: 'https://harineraelmolino.com/wp-content/uploads/2025/05/flat-lay-of-japanese-vegetable-tempura-recipe-with-ginger-ponzu-sauce.jpg' },
      ],
    },
    {
      id: 'cat-6',
      name: 'Vegetariano',
      type: 'VEGETARIANO',
      sortOrder: 6,
      items: [
        { id: '18', name: 'Tofu teriyaki', description: 'Tofu salteado con salsa dulce', price: 20000, image: 'https://fullofplants.com/wp-content/uploads/2023/07/easy-vegan-air-fryer-teriyaki-tofu-thumb-2.jpg' },
        { id: '19', name: 'Roll vegetariano', description: 'Sushi con vegetales frescos', price: 16000, image: 'https://veganos.madrid/wp-content/uploads/2023/01/sushi-vegano.jpg' },
      ],
    },
    {
      id: 'cat-7',
      name: 'Bebidas',
      type: 'BEBIDAS',
      sortOrder: 7,
      items: [
        { id: '20', name: 'Té verde', description: 'Té tradicional japonés', price: 6000, image: 'https://www.recetas-japonesas.com/base/stock/Recipe/te-verde/te-verde_web.jpg.webp' },
        { id: '21', name: 'Limonada', description: 'Refrescante bebida natural', price: 7000, image: 'https://cdn0.celebritax.com/sites/default/files/styles/rectangle_blur_1200x900/public/recetas/limonada.jpg' },
        { id: '22', name: 'Soda japonesa', description: 'Bebida gaseosa importada', price: 9000, image: 'https://instagram.fbog19-1.fna.fbcdn.net/v/t51.82787-15/625575967_18315054991270808_3740798322130529579_n.jpg' },
      ],
    },
    {
      id: 'cat-8',
      name: 'Postres',
      type: 'POSTRES',
      sortOrder: 8,
      items: [
        { id: '23', name: 'Mochi', description: 'Dulce japonés de arroz relleno', price: 10000, image: 'https://i.blogs.es/ec22c4/mochis/1200_900.jpg' },
        { id: '24', name: 'Helado tempura', description: 'Helado frito crujiente', price: 14000, image: 'https://sushicentral.mx/wp-content/uploads/2023/07/helado-tempura.jpg' },
      ],
    },
  ];

  for (const cat of categories) {
    await prisma.menuCategory.create({
      data: {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        sortOrder: cat.sortOrder,
        items: {
          create: cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: cat.type,
          })),
        },
      },
    });
  }

  console.log(`  ✓ ${categories.length} categories seeded`);
  console.log(`  ✓ ${categories.reduce((acc, c) => acc + c.items.length, 0)} menu items seeded`);

  // ─── Restaurant Tables ────────────────────────────────────────────────────
  const tables = [
    // LOW tables (2-4 guests)
    { tableNumber: 1, tableType: 'LOW', capacity: 2 },
    { tableNumber: 2, tableType: 'LOW', capacity: 2 },
    { tableNumber: 3, tableType: 'LOW', capacity: 4 },
    { tableNumber: 4, tableType: 'LOW', capacity: 4 },
    { tableNumber: 5, tableType: 'LOW', capacity: 4 },
    // HIGH tables (5-8 guests)
    { tableNumber: 6, tableType: 'HIGH', capacity: 6 },
    { tableNumber: 7, tableType: 'HIGH', capacity: 6 },
    { tableNumber: 8, tableType: 'HIGH', capacity: 8 },
    // VIP tables (9-10 guests)
    { tableNumber: 9, tableType: 'VIP', capacity: 10 },
    { tableNumber: 10, tableType: 'VIP', capacity: 10 },
  ];

  await prisma.restaurantTable.createMany({ data: tables });
  console.log(`  ✓ ${tables.length} tables seeded`);

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
