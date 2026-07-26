// ==========================================
// TRIP PLANNER VALIDATION
// ==========================================

export const validateTripForm = ({
    destination,
    startDate,
    days,
    travellers,
    budget,
    interests,
}) => {
    const errors = [];
    const warnings = [];

    // ==========================================
    // DESTINATION
    // ==========================================

    if (
        !destination ||
        !destination.trim()
    ) {
        errors.push(
            "Please enter a destination."
        );
    }

    if (
        destination &&
        destination.trim().length < 2
    ) {
        errors.push(
            "Please enter a valid destination."
        );
    }

    // ==========================================
    // START DATE
    // ==========================================

    if (!startDate) {
        errors.push(
            "Please select a start date."
        );
    } else {
        const selectedDate =
            new Date(`${startDate}T00:00:00`);

        const today = new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (
            Number.isNaN(
                selectedDate.getTime()
            )
        ) {
            errors.push(
                "Please select a valid start date."
            );
        } else if (
            selectedDate < today
        ) {
            errors.push(
                "Start date cannot be in the past."
            );
        }
    }

    // ==========================================
    // NUMBER OF DAYS
    // ==========================================

    const tripDays =
        Number(days);

    if (
        !Number.isFinite(tripDays) ||
        tripDays < 1
    ) {
        errors.push(
            "Trip duration must be at least 1 day."
        );
    }

    if (tripDays > 30) {
        errors.push(
            "Trip duration cannot exceed 30 days."
        );
    }

    // ==========================================
    // TRAVELLERS
    // ==========================================

    const numberOfTravellers =
        Number(travellers);

    if (
        !Number.isFinite(
            numberOfTravellers
        ) ||
        numberOfTravellers < 1
    ) {
        errors.push(
            "There must be at least 1 traveller."
        );
    }

    if (
        numberOfTravellers > 50
    ) {
        errors.push(
            "The planner currently supports up to 50 travellers."
        );
    }

    // ==========================================
    // BUDGET
    // ==========================================

    const totalBudget =
        Number(budget);

    if (
        !Number.isFinite(totalBudget) ||
        totalBudget <= 0
    ) {
        errors.push(
            "Please enter a valid trip budget."
        );
    }

    // ==========================================
    // INTERESTS
    // ==========================================

    if (
        !Array.isArray(interests) ||
        interests.length === 0
    ) {
        errors.push(
            "Please select at least one interest."
        );
    }

    // ==========================================
    // SMART BUDGET VALIDATION
    // ==========================================

    if (
        totalBudget > 0 &&
        tripDays > 0 &&
        numberOfTravellers > 0
    ) {
        const budgetPerPersonPerDay =
            totalBudget /
            (
                tripDays *
                numberOfTravellers
            );

        if (
            budgetPerPersonPerDay <
            500
        ) {
            warnings.push(
                `Your budget is very limited at approximately ₹${Math.round(
                    budgetPerPersonPerDay
                )} per person per day. Consider increasing the budget or reducing the trip duration.`
            );
        }

        if (
            budgetPerPersonPerDay >
            15000
        ) {
            warnings.push(
                "Your budget is relatively high for the selected duration. Premium accommodation, private transport and premium activities may fit within your plan."
            );
        }
    }

    // ==========================================
    // RETURN RESULT
    // ==========================================

    return {
        isValid:
            errors.length === 0,

        errors,

        warnings,
    };
};