export const websites = [
    {
        name: "XE.gr",
        baseUrl: "https://www.xe.gr/property/results",
        params: {
            transaction_name: "rent",
            item_type: "re_residence",
            country: "GR",
            maximum_price: "480",
            minimum_level: "LH",
            publication_age: "3",
            geo_place_ids: ["ChIJTazECEejoRQRYRYsuxSJ348", "ChIJvUGcxaS8oRQRhQVsOC1EXzw", "ChIJIZwoz9W6oRQREHu54iy9AAQ",
                "ChIJDUTbosG8oRQR2STTA-9e2SA", "ChIJvXOxxEy8oRQRl3mevrHaz1U", "ChIJRzGst-u7oRQR9_0w_5XaINg", "ChIJtSZnbri9oRQRsHi54iy9AAQ"]
        },
        selectors: {
            adContainer: ".common-ad",
            title: "[data-testid='property-ad-title']",
            price: "[data-testid='property-ad-price']",
            pricePerSqm: "[data-testid='property-ad-price-per-sqm']",
            bedrooms: "[data-testid='property-ad-bedrooms']",
            bathrooms: "[data-testid='property-ad-bathrooms']",
            floor: "[data-testid$='-level']",
            yearBuilt: "[data-testid='property-ad-construction-year']",
            address: "[data-testid='property-ad-address']",
            url: "[data-testid='property-ad-url']",
            images: "[data-testid^='ad-gallery-image-']"
        },
        pagination: {
            param: "page",
            start: 1
        }
    },
    {
        name: "Spitogatos.gr",
        baseUrl: "https://www.spitogatos.gr/sale",
        params: {
            city: "athens",
            property_type: "apartment"
        },
        selectors: {
            adContainer: ".listing-item",
            title: ".listing-title",
            price: ".listing-price",
            pricePerSqm: ".price-per-sqm",
            bedrooms: ".listing-bedrooms",
            bathrooms: ".listing-bathrooms",
            floor: ".listing-floor",
            yearBuilt: ".listing-year",
            address: ".listing-location",
            url: "a.listing-link",
            images: "img.listing-image"
        },
        pagination: {
            param: "page",
            start: 1
        }
    },
    {
        name: "Tospitimou.gr",
        baseUrl: "https://www.tospitimou.gr/property",
        params: {
            type: "rent",
            category: "house"
        },
        selectors: {
            adContainer: ".property-card",
            title: ".property-title",
            price: ".property-price",
            pricePerSqm: ".property-price-per-sqm",
            bedrooms: ".property-bedrooms",
            bathrooms: ".property-bathrooms",
            floor: ".property-floor",
            yearBuilt: ".property-year",
            address: ".property-address",
            url: "a.property-link",
            images: "img.property-image"
        },
        pagination: {
            param: "page",
            start: 1
        }
    }
];
