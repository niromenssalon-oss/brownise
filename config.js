// NIRO Men's Salon — EASY-TO-EDIT SETTINGS
// Change prices, service durations, barber names, shifts, WhatsApp number, etc. here.
// Shift times use 24-hour format. A shift like 19:00 -> 08:00 crosses midnight.

window.NIRO_CONFIG = {
  salon: {
    name: "NIRO MEN'S SALON",
    tagline: "Modern grooming. Sharp confidence.",
    location: "Al Mansoura, Doha, Qatar",
    whatsapp: "+97471811265",
    instagram: "https://www.instagram.com/niro_mens_salon?igsi=MWdhZTI4MWt1NDY4dQ==",
    openingLabel: "OPEN 24 HOURS",
    maps: "https://maps.app.goo.gl/mVeZFDiXCTgwWhz57",
  },

  services: [
    { id: "haircut", name: "Hair Cut", price: 20, duration: 30, category: "Core Grooming", note: "Clean, tailored and finished to your face shape." },
    { id: "fade", name: "Skin Fade Cut", price: 25, duration: 40, category: "Core Grooming", note: "Precise skin fade with a polished finish." },
    { id: "beard", name: "Beard Cut", price: 15, duration: 20, category: "Core Grooming", note: "Shape, line-up and detail." },
    { id: "facial", name: "Facial", price: 75, duration: 60, category: "Skin Care", note: "Deep cleanse and premium facial care." },
    { id: "scrub", name: "Scrub", price: 25, duration: 30, category: "Skin Care", note: "Refreshing exfoliation for smoother skin." },
    { id: "curl", name: "Hair Curl", price: 200, duration: 150, category: "Hair Treatment", note: "Starting from 200 QR. Final price depends on hair length and volume." },
    { id: "highlight", name: "Highlight Colour", price: 150, duration: 150, category: "Hair Treatment", note: "Starting from 150 QR. Consultation required for final price." },
    { id: "keratin", name: "Keratin", price: 200, duration: 180, category: "Hair Treatment", note: "Starting from 200 QR. Final price depends on hair length and volume." },
    { id: "protein", name: "Protein", price: 200, duration: 180, category: "Hair Treatment", note: "Starting from 200 QR. Final price depends on hair length and volume." },
    { id: "style", name: "Hair Style", price: 10, duration: 15, category: "Finishing", note: "Quick styling and finishing." },
  ],

  barbers: [
    { id: "sifu-attari", name: "Sifu Attari", nationality: "Algerian", shiftStart: "14:00", shiftEnd: "00:00", accent: "#d7b56d" },
    { id: "trafis", name: "Trafis", nationality: "Algerian", shiftStart: "14:00", shiftEnd: "00:00", accent: "#c99f55" },
    { id: "supun", name: "Supun", nationality: "Sri Lankan", shiftStart: "19:00", shiftEnd: "08:00", accent: "#8fb8a8" },
    { id: "madusanka", name: "Madusanka", nationality: "Sri Lankan", shiftStart: "19:00", shiftEnd: "08:00", accent: "#6ea991" },
    { id: "saad", name: "Saad", nationality: "Pakistani", shiftStart: "08:00", shiftEnd: "20:00", accent: "#a9a6c4" },
  ],

  booking: {
    slotMinutes: 15,
    leadTimeMinutes: 0,
    storageKey: "niroBookingsV1",
  }
};
