const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialClothing = [
    {
        original_id: 1, // keeping track
        name: "Sky Knit Pullover",
        category: "TOP", // Map to TOP
        gender: "FEMALE", // Map to FEMALE
        style: "Minimal",
        price: 129000,
        design_img_url: "http://172.10.5.178/images/designs/1_front.png", // Valid file
        size_specs: { shoulder: 46, chest: 104, waist: 90 },
        brandName: "SKYLINE", // Link to brand
    },
    {
        original_id: 2,
        name: "Rose Short Jacket",
        category: "OUTER", // Map to OUTER
        gender: "FEMALE",
        style: "Romantic",
        price: 189000,
        design_img_url: "http://172.10.5.178/images/designs/1_front.png", // Fallback to valid Image 1
        size_specs: { shoulder: 42, chest: 96, waist: 86 },
        brandName: "ROSE FORM",
    },
    {
        original_id: 3,
        name: "Chestnut Blazer",
        category: "OUTER", // Map
        gender: "MALE", // Map
        style: "Classic",
        price: 219000,
        design_img_url: "http://172.10.5.178/images/designs/1_3_front.png", // Valid file
        size_specs: { shoulder: 44, chest: 102, waist: 92 },
        brandName: "CHESTNUT LAB",
    },
    {
        original_id: 4,
        name: "Oat Knit Sweater",
        category: "TOP", // Map
        gender: "UNISEX",
        style: "Minimal",
        price: 149000,
        design_img_url: "http://172.10.5.178/images/dummy.png", // Fallback
        size_specs: { shoulder: 48, chest: 106, waist: 94 },
        brandName: "OAT EDITION",
    },
    {
        original_id: 5,
        name: "Midnight Puffer",
        category: "OUTER", // Map
        gender: "UNISEX",
        style: "Street",
        price: 279000,
        design_img_url: "http://172.10.5.178/images/dummy.png", // Fallback
        size_specs: { shoulder: 50, chest: 114, waist: 106 },
        brandName: "MIDNIGHT",
    },
    {
        original_id: 6,
        name: "Cloud Belt Coat",
        category: "OUTER", // Map
        gender: "FEMALE",
        style: "Classic",
        price: 249000,
        design_img_url: "http://172.10.5.178/images/dummy.png", // Fallback covering image6 error
        size_specs: { shoulder: 46, chest: 108, waist: 100 },
        brandName: "CLOUD LINE",
    },
    {
        original_id: 7,
        name: "Ink Slip Dress",
        category: "TOP", // Map (Dress -> TOP is not ideal but schema limits)
        gender: "FEMALE",
        style: "Romantic",
        price: 159000,
        design_img_url: "http://172.10.5.178/images/dummy.png", // Fallback covering image7 error
        size_specs: { shoulder: 36, chest: 82, waist: 66 },
        brandName: "INK ATELIER",
    },
];

const brandProfiles = [
    {
        id: 1,
        brand: "SKYLINE",
        handle: "@skyline.designer",
        followerCount: 1284,
        bio: "City balance and clean silhouettes.",
    },
    {
        id: 2,
        brand: "ROSE FORM",
        handle: "@rose.form",
        followerCount: 986,
        bio: "Romantic tailoring with soft materials.",
    },
    {
        id: 3,
        brand: "CHESTNUT LAB",
        handle: "@chestnut.lab",
        followerCount: 760,
        bio: "Classic structure with subtle experiments.",
    },
    {
        id: 4,
        brand: "OAT EDITION",
        handle: "@oat.edition",
        followerCount: 612,
        bio: "Minimal, daily-ready silhouettes.",
    },
    {
        id: 5,
        brand: "MIDNIGHT",
        handle: "@midnight.lab",
        followerCount: 1540,
        bio: "Exploring the edge of street and archive.",
    },
    {
        id: 6,
        brand: "CLOUD LINE",
        handle: "@cloud.line",
        followerCount: 1320,
        bio: "Comfort-focused fits and material tests.",
    },
    {
        id: 7,
        brand: "INK ATELIER",
        handle: "@ink.atelier",
        followerCount: 884,
        bio: "Atelier balance with refined detail.",
    },
];

const initialFunding = [
    {
        clothing_id: 1, // Maps to Sky Knit Pullover (original_id 1)
        brand: "SKYLINE",
        likes: 128,
        status: "FUNDING",
        goal_amount: 2200000,
        current_amount: 860000,
        deadline: new Date("2026-03-01"), // Made up
    },
    {
        clothing_id: 2,
        brand: "ROSE FORM",
        likes: 256,
        status: "FUNDING",
        goal_amount: 2600000,
        current_amount: 1120000,
        deadline: new Date("2026-03-01"),
    },
    {
        clothing_id: 3,
        brand: "CHESTNUT LAB",
        likes: 94,
        status: "FUNDING",
        goal_amount: 3200000,
        current_amount: 980000,
        deadline: new Date("2026-03-01"),
    },
    {
        clothing_id: 4,
        brand: "OAT EDITION",
        likes: 73,
        status: "FUNDING",
        goal_amount: 1800000,
        current_amount: 760000,
        deadline: new Date("2026-03-01"),
    },
    {
        clothing_id: 5,
        brand: "MIDNIGHT",
        likes: 312,
        status: "FUNDING",
        goal_amount: 4800000,
        current_amount: 2140000,
        deadline: new Date("2026-03-01"),
    },
    {
        clothing_id: 6,
        brand: "CLOUD LINE",
        likes: 188,
        status: "FUNDING",
        goal_amount: 5400000,
        current_amount: 2460000,
        deadline: new Date("2026-03-01"),
    },
    {
        clothing_id: 7,
        brand: "INK ATELIER",
        likes: 142,
        status: "FUNDING",
        goal_amount: 2100000,
        current_amount: 940000,
        deadline: new Date("2026-03-01"),
    },
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

        const cloth = await prisma.cloth.create({
            data: {
                brand_id: brand.brand_id,
                clothing_name: c.name,
                category: c.category,
                gender: c.gender,
                style: c.style,
                price: c.price,
                thumbnail_url: c.design_img_url,
                final_result_front_url: c.design_img_url, // Use same image for result
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
