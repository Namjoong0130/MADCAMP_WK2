const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SERVER_URL = process.env.SERVER_URL || "http://172.10.5.178";

const brandProfiles = [
    {
        id: 1,
        brand: "LUMEN STUDIO",
        handle: "@lumen.studio",
        followerCount: 1394,
        bio: "Soft structure and calm daily wear.",
    },
    {
        id: 2,
        brand: "NOUVEAU FORM",
        handle: "@nouveau.form",
        followerCount: 1120,
        bio: "Gentle romance with balanced tailoring.",
    },
    {
        id: 3,
        brand: "RIVERLINE",
        handle: "@riverline.lab",
        followerCount: 840,
        bio: "Classic silhouettes with modern ease.",
    },
    {
        id: 4,
        brand: "STONEYARD",
        handle: "@stoneyard",
        followerCount: 980,
        bio: "Workwear roots with refined fit.",
    },
    {
        id: 5,
        brand: "BLACKCURRENT",
        handle: "@blackcurrent.lab",
        followerCount: 1660,
        bio: "Dark-toned outerwear and street details.",
    },
    {
        id: 6,
        brand: "ECHO ATELIER",
        handle: "@echo.atelier",
        followerCount: 1042,
        bio: "Sport-driven layers with clean lines.",
    },
];

const initialClothing = [
    {
        original_id: 1,
        name: "Blue Round Neck Knit",
        category: "TOP",
        gender: "FEMALE",
        style: "Minimal",
        price: 119000,
        design_img_url: "/image1.jpeg",
        size_specs: { shoulder: 42, chest: 96, waist: 84 },
        brandName: "LUMEN STUDIO",
    },
    {
        original_id: 2,
        name: "Cream Straight Denim",
        category: "BOTTOM",
        gender: "UNISEX",
        style: "Minimal",
        price: 89000,
        design_img_url: "/image2.jpeg",
        size_specs: { shoulder: 0, chest: 0, waist: 78 },
        brandName: "NOUVEAU FORM",
    },
    {
        original_id: 3,
        name: "Ivory High-Waist Linen Shorts",
        category: "BOTTOM",
        gender: "FEMALE",
        style: "Minimal",
        price: 69000,
        design_img_url: "/image3.webp",
        size_specs: { shoulder: 0, chest: 0, waist: 66 },
        brandName: "RIVERLINE",
    },
    {
        original_id: 4,
        name: "Black Pinstripe Ruffle Pants",
        category: "BOTTOM",
        gender: "FEMALE",
        style: "Unique",
        price: 109000,
        design_img_url: "/image4.webp",
        size_specs: { shoulder: 0, chest: 0, waist: 70 },
        brandName: "LUMEN STUDIO",
    },
    {
        original_id: 5,
        name: "Beige Belted Trench Coat",
        category: "OUTER",
        gender: "FEMALE",
        style: "Classic",
        price: 269000,
        design_img_url: "/image5.jpeg",
        size_specs: { shoulder: 48, chest: 108, waist: 98 },
        brandName: "BLACKCURRENT",
    },
    {
        original_id: 6,
        name: "Check Ruffle Mini Skirt",
        category: "BOTTOM",
        gender: "FEMALE",
        style: "Romantic",
        price: 159000,
        design_img_url: "/image6.webp",
        size_specs: { shoulder: 36, chest: 84, waist: 68 },
        brandName: "ECHO ATELIER",
    },
    {
        original_id: 7,
        name: "Black Wrinkle Slip Dress",
        category: "TOP",
        gender: "FEMALE",
        style: "Minimal",
        price: 169000,
        design_img_url: "/image7.png",
        size_specs: { shoulder: 37, chest: 86, waist: 70 },
        brandName: "NOUVEAU FORM",
    },
];

const initialFunding = [
    { clothing_id: 1, brand: "LUMEN STUDIO", likes: 164, status: "FUNDING", goal_amount: 2100000, current_amount: 920000, deadline: new Date("2026-03-01") },
    { clothing_id: 2, brand: "NOUVEAU FORM", likes: 214, status: "FUNDING", goal_amount: 2400000, current_amount: 1260000, deadline: new Date("2026-03-01") },
    { clothing_id: 3, brand: "RIVERLINE", likes: 96, status: "FUNDING", goal_amount: 2800000, current_amount: 1040000, deadline: new Date("2026-03-01") },
    { clothing_id: 4, brand: "LUMEN STUDIO", likes: 88, status: "FUNDING", goal_amount: 1700000, current_amount: 640000, deadline: new Date("2026-03-01") },
    { clothing_id: 5, brand: "BLACKCURRENT", likes: 298, status: "FUNDING", goal_amount: 4600000, current_amount: 2360000, deadline: new Date("2026-03-01") },
    { clothing_id: 6, brand: "ECHO ATELIER", likes: 204, status: "FUNDING", goal_amount: 2300000, current_amount: 1120000, deadline: new Date("2026-03-01") },
    { clothing_id: 7, brand: "NOUVEAU FORM", likes: 136, status: "FUNDING", goal_amount: 2200000, current_amount: 980000, deadline: new Date("2026-03-01") },
];

async function main() {
    console.log('Seeding started...');

    // 1. Create Brands (and their Owners)
    // We need to create a User for each Brand first because Brand requires owner_id.
    const brandMap = {}; // Name -> Brand Object

    for (const b of brandProfiles) {
        const email = `owner_${b.handle.replace('@', '')}@example.com`;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    userName: b.brand + " Owner",
                    password: "password123", // Dummy password
                    height: 170,
                    weight: 60,
                    is_creator: true,
                },
            });
        }

        // Check if brand exists
        let brand = await prisma.brand.findUnique({ where: { owner_id: user.user_id } });
        if (!brand) {
            brand = await prisma.brand.create({
                data: {
                    owner_id: user.user_id,
                    brand_name: b.brand,
                    brand_story: b.bio,
                    totalFollowers: b.followerCount,
                },
            });
        }
        brandMap[b.brand] = brand;
        console.log(`Created/Found Brand: ${b.brand}`);
    }

    // 2. Create Clothes
    // Map original_id to new DB id if needed, but we process in order.
    const clothMap = {}; // original_id -> new Cloth Object

    for (const c of initialClothing) {
        const brand = brandMap[c.brandName];
        if (!brand) {
            console.warn(`Brand ${c.brandName} not found for cloth ${c.name}`);
            continue;
        }

        // Prepend SERVER_URL to images
        const fullUrl = c.design_img_url.startsWith('http')
            ? c.design_img_url
            : `${SERVER_URL}/images${c.design_img_url}`;

        const cloth = await prisma.cloth.create({
            data: {
                brand_id: brand.brand_id,
                clothing_name: c.name,
                category: c.category,
                gender: c.gender,
                style: c.style,
                price: c.price,
                thumbnail_url: fullUrl,
                final_result_front_url: fullUrl,
                size_specs: c.size_specs,
                stretch: 5, weight: 5, stiffness: 5, thickness: 5, layer_order: 1, // Defaults
            },
        });
        clothMap[c.original_id] = cloth;
        console.log(`Created Cloth: ${c.name}`);
    }

    // 3. Create Fundings
    for (const f of initialFunding) {
        const cloth = clothMap[f.clothing_id];
        if (!cloth) {
            console.warn(`Cloth ID ${f.clothing_id} not found for funding`);
            continue;
        }
        const brand = brandMap[f.brand];
        // Check if funding already exists (by clothing_id unique constraint)
        const existingFund = await prisma.fund.findUnique({ where: { clothing_id: cloth.clothing_id } });

        if (!existingFund && brand) {
            await prisma.fund.create({
                data: {
                    clothing_id: cloth.clothing_id,
                    user_id: brand.owner_id,
                    title: `Funding for ${cloth.clothing_name}`,
                    goal_amount: f.goal_amount,
                    current_amount: f.current_amount,
                    status: f.status,
                    deadline: f.deadline,
                },
            });

            // Update likeCount on cloth
            await prisma.cloth.update({
                where: { clothing_id: cloth.clothing_id },
                data: { likeCount: f.likes }
            });

            console.log(`Created Funding for: ${cloth.clothing_name}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
