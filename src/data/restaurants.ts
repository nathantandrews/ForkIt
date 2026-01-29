import { Restaurant } from '../types/models';

export const RESTAURANTS: Restaurant[] = [
    {
        id: "r1",
        name: "Burger Joint",
        cuisines: ["American", "Burgers"],
        priceTier: 2,
        distance: 1.2,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "23:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["gluten", "dairy"],
        rating: 4.2
    },
    {
        id: "r2",
        name: "Green Leaf Cafe",
        cuisines: ["Healthy", "Salad", "Vegan"],
        priceTier: 2,
        distance: 0.5,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "08:00", end: "20:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["nuts"],
        rating: 4.5
    },
    {
        id: "r3",
        name: "Pasta Palace",
        cuisines: ["Italian"],
        priceTier: 3,
        distance: 2.0,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "17:00", end: "22:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["gluten", "eggs", "dairy"],
        rating: 4.0
    },
    {
        id: "r4",
        name: "Sushi Zen",
        cuisines: ["Japanese", "Sushi"],
        priceTier: 4,
        distance: 3.5,
        openHours: [{ days: [1, 2, 3, 4, 5, 6], start: "12:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["shellfish", "fish", "soy"],
        rating: 4.8
    },
    {
        id: "r5",
        name: "Taco Fiesta",
        cuisines: ["Mexican", "Tacos"],
        priceTier: 1,
        distance: 1.5,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "10:00", end: "24:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["dairy", "corn"],
        rating: 4.1
    },
    {
        id: "r6",
        name: "Curry House",
        cuisines: ["Indian", "Curry"],
        priceTier: 2,
        distance: 2.5,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["dairy", "nuts"],
        rating: 4.4
    },
    {
        id: "r7",
        name: "Pizza Heaven",
        cuisines: ["Italian", "Pizza"],
        priceTier: 2,
        distance: 1.0,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "23:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["gluten", "dairy"],
        rating: 4.3
    },
    {
        id: "r8",
        name: "Steakhouse Prime",
        cuisines: ["Steakhouse", "American"],
        priceTier: 4,
        distance: 4.0,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "17:00", end: "23:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: false },
        allergens: ["dairy"],
        rating: 4.6
    },
    {
        id: "r9",
        name: "Pho Real",
        cuisines: ["Vietnamese", "Pho"],
        priceTier: 1,
        distance: 1.8,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "10:00", end: "21:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["fish", "soy"],
        rating: 4.2
    },
    {
        id: "r10",
        name: "Falafel Corner",
        cuisines: ["Mediterranean", "Falafel"],
        priceTier: 1,
        distance: 0.8,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "10:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["sesame", "gluten"],
        rating: 4.5
    },
    {
        id: "r11",
        name: "BBQ Barn",
        cuisines: ["BBQ", "American"],
        priceTier: 3,
        distance: 5.0,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "21:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: false },
        allergens: ["gluten", "mustard"],
        rating: 4.3
    },
    {
        id: "r12",
        name: "Dim Sum Delight",
        cuisines: ["Chinese", "Dim Sum"],
        priceTier: 2,
        distance: 2.2,
        openHours: [{ days: [0, 6], start: "09:00", end: "15:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: false, halalOptions: false, vegetarianFriendly: true },
        allergens: ["shellfish", "soy", "gluten", "pork"],
        rating: 4.1
    },
    {
        id: "r13",
        name: "Thai Spice",
        cuisines: ["Thai"],
        priceTier: 2,
        distance: 1.5,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["peanuts", "fish", "shellfish"],
        rating: 4.4
    },
    {
        id: "r14",
        name: "French Bistro",
        cuisines: ["French"],
        priceTier: 4,
        distance: 3.2,
        openHours: [{ days: [2, 3, 4, 5, 6], start: "18:00", end: "22:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["dairy", "eggs", "gluten"],
        rating: 4.7
    },
    {
        id: "r15",
        name: "Bagel Shop",
        cuisines: ["Breakfast", "Bagels"],
        priceTier: 1,
        distance: 0.3,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "06:00", end: "14:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: false, halalOptions: true, vegetarianFriendly: true },
        allergens: ["gluten", "sesame"],
        rating: 4.0
    },
    {
        id: "r16",
        name: "K-BBQ House",
        cuisines: ["Korean", "BBQ"],
        priceTier: 3,
        distance: 2.8,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "16:00", end: "23:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: false, halalOptions: false, vegetarianFriendly: false },
        allergens: ["soy", "sesame", "beef"],
        rating: 4.6
    },
    {
        id: "r17",
        name: "Seafood Shack",
        cuisines: ["Seafood"],
        priceTier: 3,
        distance: 4.5,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "12:00", end: "21:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["shellfish", "fish"],
        rating: 4.2
    },
    {
        id: "r18",
        name: "Ramen Bar",
        cuisines: ["Japanese", "Ramen"],
        priceTier: 2,
        distance: 1.7,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "23:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: false, halalOptions: false, vegetarianFriendly: true },
        allergens: ["wheat", "soy", "egg", "pork"],
        rating: 4.5
    },
    {
        id: "r19",
        name: "Smoothie Bowl",
        cuisines: ["Healthy", "Breakfast"],
        priceTier: 2,
        distance: 0.9,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "07:00", end: "16:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["nuts"],
        rating: 4.3
    },
    {
        id: "r20",
        name: "Ethiopian Eats",
        cuisines: ["Ethiopian"],
        priceTier: 2,
        distance: 3.1,
        openHours: [{ days: [2, 3, 4, 5, 6, 0], start: "17:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: false, halalOptions: true, vegetarianFriendly: true },
        allergens: ["gluten"], // injera often has some wheat/gluten unless teff-only
        rating: 4.4
    },
    {
        id: "r21",
        name: "Diner 24",
        cuisines: ["American", "Diner"],
        priceTier: 1,
        distance: 1.6,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "00:00", end: "24:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["dairy", "eggs", "gluten"],
        rating: 3.8
    },
    {
        id: "r22",
        name: "Greek Taverna",
        cuisines: ["Greek", "Mediterranean"],
        priceTier: 3,
        distance: 2.1,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "12:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["dairy", "gluten"],
        rating: 4.5
    },
    {
        id: "r23",
        name: "Pancake House",
        cuisines: ["Breakfast", "American"],
        priceTier: 2,
        distance: 1.3,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "06:00", end: "14:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["eggs", "dairy", "gluten"],
        rating: 4.1
    },
    {
        id: "r24",
        name: "Hot Pot City",
        cuisines: ["Chinese", "Hot Pot"],
        priceTier: 3,
        distance: 2.9,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "23:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: true },
        allergens: ["soy", "shellfish", "sesame"],
        rating: 4.6
    },
    {
        id: "r25",
        name: "Wings World",
        cuisines: ["American", "Wings"],
        priceTier: 2,
        distance: 2.3,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "01:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: false },
        allergens: ["dairy"],
        rating: 3.9
    },
    {
        id: "r26",
        name: "Sandwich Board",
        cuisines: ["Sandwiches", "Deli"],
        priceTier: 1,
        distance: 0.6,
        openHours: [{ days: [1, 2, 3, 4, 5], start: "10:00", end: "16:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["gluten", "mustard"],
        rating: 4.2
    },
    {
        id: "r27",
        name: "Ice Cream Parlor",
        cuisines: ["Dessert"],
        priceTier: 1,
        distance: 1.1,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "12:00", end: "22:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["dairy", "nuts"],
        rating: 4.8
    },
    {
        id: "r28",
        name: "Brazilian Steakhouse",
        cuisines: ["Brazilian", "Steakhouse"],
        priceTier: 4,
        distance: 5.2,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "17:00", end: "22:00" }],
        dietarySupport: { veganFriendly: false, glutenFreeOptions: true, halalOptions: false, vegetarianFriendly: false },
        allergens: ["dairy"],
        rating: 4.7
    },
    {
        id: "r29",
        name: "Donut Shop",
        cuisines: ["Bakery", "Breakfast"],
        priceTier: 1,
        distance: 0.7,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "05:00", end: "13:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: false, halalOptions: true, vegetarianFriendly: true },
        allergens: ["gluten", "eggs", "dairy"],
        rating: 4.4
    },
    {
        id: "r30",
        name: "Vegetarian Village",
        cuisines: ["Vegetarian", "Healthy"],
        priceTier: 2,
        distance: 1.9,
        openHours: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "11:00", end: "21:00" }],
        dietarySupport: { veganFriendly: true, glutenFreeOptions: true, halalOptions: true, vegetarianFriendly: true },
        allergens: ["soy", "nuts"],
        rating: 4.3
    }
];
