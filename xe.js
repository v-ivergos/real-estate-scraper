import { chromium } from "playwright";
import { websites } from "./config.js";
import * as dotenv from "dotenv";
// import fetch from "axios";
import fs from "fs";

dotenv.config();

const FIREBASE_API_URL = process.env.FIREBASE_API_URL;

export async function scrapeXE() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 50
    });

    const contextOptions = {
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        locale: "el-GR",
        timezoneId: "Europe/Athens",
        viewport: { width: 1366, height: 768 },
        colorScheme: "light"
    };

    if (fs.existsSync("state.json")) {
        console.log("♻ Reusing session from state.json");
        contextOptions.storageState = "state.json";
    } else {
        console.log("🆕 No session yet, starting fresh");
    }

    const context = await browser.newContext(contextOptions); // ✅ MUST be here

    const page = await context.newPage();

    let totalResults = 0;
    const site = websites[0];
    const seen = new Set();

    console.log(`Ξεκινάμε scraping από: ${site.name}`);

    const startUrl = new URL(site.baseUrl);
    Object.entries(site.params).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach(v => startUrl.searchParams.append(key + "[]", v));
        else startUrl.searchParams.set(key, value);
    });
    startUrl.searchParams.set(site.pagination.param, site.pagination.start);

    await page.goto(startUrl.toString(), { waitUntil: "domcontentloaded" });
    await humanIdle(page);
    // await autoScroll(page);

    const totalPages = await page.evaluate(() => {
        const pagination = document.querySelector("ul.results-pagination");
        if (!pagination) return 1;

        const pageLinks = Array.from(pagination.querySelectorAll("li a"))
            .filter(a => {
                const text = a.textContent.trim();
                return text && !isNaN(parseInt(text));
            })
            .map(a => parseInt(a.textContent.trim()));

        return pageLinks.length ? Math.max(...pageLinks) : 1;
    });

    console.log("Συνολικές σελίδες:", totalPages);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Φόρτωση σελίδας ${pageNum}...`);

        const pageUrl = new URL(site.baseUrl);
        Object.entries(site.params).forEach(([key, value]) => {
            if (Array.isArray(value)) value.forEach(v => pageUrl.searchParams.append(key + "[]", v));
            else pageUrl.searchParams.set(key, value);
        });
        pageUrl.searchParams.set(site.pagination.param, pageNum);

        await page.goto(pageUrl.toString(), { waitUntil: "domcontentloaded" });
        await humanIdle(page);

        // const html = await page.content();
        // if (/captcha|verify|human|robot/i.test(html)) {
        //     console.log("⚠ CAPTCHA detected. Stopping.");
        //     // break;
        // }

        try {
            await page.waitForSelector(site.selectors.adContainer, { timeout: 15000 });
        } catch {
            console.log(`Δεν βρέθηκαν αγγελίες στη σελίδα ${pageNum}, τερματισμός.`);
            break;
        }

        await autoScroll(page);

        const listings = await page.evaluate(config => {
            return Array.from(document.querySelectorAll(config.selectors.adContainer)).map(el => ({
                id: el.id || el.querySelector(config.selectors.url)?.getAttribute("href") || "",
                title: el.querySelector(config.selectors.title)?.innerText.trim() || "",
                price: el.querySelector(config.selectors.price)?.innerText.trim() || "",
                pricePerSqm: el.querySelector(config.selectors.pricePerSqm)?.innerText.trim() || "",
                bedrooms: el.querySelector(config.selectors.bedrooms)?.innerText.trim() || "",
                bathrooms: el.querySelector(config.selectors.bathrooms)?.innerText.trim() || "",
                floor: el.querySelector(config.selectors.floor)?.innerText.trim() || "",
                yearBuilt: el.querySelector(config.selectors.yearBuilt)?.innerText.trim() || "",
                address: el.querySelector(config.selectors.address)?.innerText.trim() || "",
                url: el.querySelector(config.selectors.url)?.href || "",
                images: Array.from(el.querySelectorAll(config.selectors.images)).map(
                    img => img.src || img.getAttribute("data-url")
                )
            }));
        }, site);

        for (const listing of listings) {
            if (!listing.id || seen.has(listing.id)) continue;
            seen.add(listing.id);

            try {
                // await fetch(`${FIREBASE_API_URL}/houses`, {
                //     method: "POST",
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify(listing)
                // });
                console.log("Saved:", listing.title);
            } catch (err) {
                console.error("Save failed:", err.message);
            }

            await sleep(500 + Math.random() * 1000);
        }

        totalResults += listings.length;
        console.log(`Σύνολο αγγελιών: ${totalResults}`);

        if (pageNum % 8 === 0) {
            console.log("☕ Coffee break...");
            await sleep(30000 + Math.random() * 30000);
        }

        await sleep(6000 + Math.random() * 8000);
    }

    await context.storageState({ path: "state.json" });
    await context.close();
    await browser.close();

    console.log("Scraping ολοκληρώθηκε. Σύνολο:", totalResults);
}

async function humanIdle(page, min = 2000, max = 6000) {
    const t = min + Math.random() * (max - min);
    await page.mouse.move(
        200 + Math.random() * 600,
        200 + Math.random() * 400,
        { steps: 20 }
    );
    await page.waitForTimeout(t);
}

async function autoScroll(page) {
    const steps = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, 300 + Math.random() * 400);
        await page.waitForTimeout(800 + Math.random() * 1200);
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
