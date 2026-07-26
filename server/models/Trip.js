import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
    {
        // =========================
        // USER
        // =========================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // =========================
        // BASIC TRIP DETAILS
        // =========================

        destination: {
            type: String,
            required: true,
            trim: true,
        },

        startDate: {
            type: String,
            required: true,
        },

        days: {
            type: Number,
            required: true,
            min: 1,
        },

        travellers: {
            type: Number,
            required: true,
            min: 1,
        },

        totalBudget: {
            type: Number,
            required: true,
            min: 0,
        },

        // =========================
        // SMART BUDGET
        // =========================

        budgetPerPerson: {
            type: Number,
            default: 0,
        },

        budgetPerDay: {
            type: Number,
            default: 0,
        },

        budgetPerPersonPerDay: {
            type: Number,
            default: 0,
        },

        budgetLevel: {
            type: String,
            default: "moderate",
        },

        budgetLabel: {
            type: String,
            default: "",
        },

        budgetRecommendation: {
            type: String,
            default: "",
        },

        budgetBreakdown: {
            accommodation: {
                type: Number,
                default: 0,
            },

            food: {
                type: Number,
                default: 0,
            },

            transport: {
                type: Number,
                default: 0,
            },

            activities: {
                type: Number,
                default: 0,
            },

            reserve: {
                type: Number,
                default: 0,
            },
        },

        // =========================
        // INTERESTS
        // =========================

        interests: {
            type: [String],
            default: [],
        },

        // =========================
        // ITINERARY
        // =========================

        itinerary: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        // =========================
        // WEATHER
        // =========================

        weather: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Trip = mongoose.model(
    "Trip",
    tripSchema
);

export default Trip;