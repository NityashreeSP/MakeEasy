// =========================
// VEHICLE RECOMMENDATIONS
// =========================

export const getVehicleRecommendation = ({
    travellers,
    budgetLevel,
    days,
}) => {
    const people = Math.max(
        Number(travellers) || 1,
        1
    );

    const tripDays = Math.max(
        Number(days) || 1,
        1
    );

    let vehicle;
    let reason;

    // =========================
    // GROUP SIZE
    // =========================

    if (people <= 3) {
        vehicle = "Hatchback / Sedan";

        reason =
            "A hatchback or sedan is suitable for a small group and provides convenient local travel.";
    }

    else if (people <= 6) {
        vehicle = "SUV / MUV";

        reason =
            "An SUV or MUV provides better seating and luggage space for a medium-sized group.";
    }

    else if (people <= 12) {
        vehicle = "Tempo Traveller";

        reason =
            "A Tempo Traveller is suitable for a larger group and allows everyone to travel together.";
    }

    else {
        vehicle = "Minibus";

        reason =
            "A minibus is more practical for a large group travelling together.";
    }


    // =========================
    // BUDGET ADVICE
    // =========================

    let budgetAdvice;

    if (budgetLevel === "budget") {
        budgetAdvice =
            "Compare shared transport, autos and economical rental options before booking a private vehicle.";
    }

    else if (budgetLevel === "premium") {
        budgetAdvice =
            "Your budget allows you to consider private cabs, premium vehicles or full-day rentals.";
    }

    else {
        budgetAdvice =
            "Compare full-day rental and point-to-point cab prices to find the best balance between cost and convenience.";
    }


    // =========================
    // RENTAL TYPE
    // =========================

    let rentalType;

    if (tripDays >= 3) {
        rentalType =
            "Multi-day Rental";
    } else {
        rentalType =
            "Daily Rental / Local Cab";
    }


    return {
        vehicle,
        rentalType,
        reason,
        budgetAdvice,
    };
};


// =========================
// BUILD VEHICLE SEARCH QUERY
// =========================

export const buildVehicleSearchQuery = ({
    destination,
    vehicle,
}) => {
    return encodeURIComponent(
        `${vehicle} rental cab in ${destination}`
    );
};