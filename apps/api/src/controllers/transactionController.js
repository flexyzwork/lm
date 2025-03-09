"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransaction = exports.createStripePaymentIntent = exports.listTransactions = void 0;
var stripe_1 = require("stripe");
var dotenv_1 = require("dotenv");
var client_1 = require("@prisma/client");
dotenv_1.default.config();
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required but was not found in env variables");
}
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
var prisma = new client_1.PrismaClient();
var prismaTx = prisma.transaction;
/**
 * 🔹 사용자의 트랜잭션(결제 내역) 조회
 */
var listTransactions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, transactions, _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.query.userId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                if (!userId) return [3 /*break*/, 3];
                return [4 /*yield*/, prismaTx.findMany({
                        where: { userId: String(userId) },
                        include: { course: true },
                    })];
            case 2:
                _a = _b.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, prismaTx.findMany({ include: { course: true } })];
            case 4:
                _a = _b.sent();
                _b.label = 5;
            case 5:
                transactions = _a;
                res.json({ message: "Transactions retrieved successfully", data: transactions });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                console.error("❌ Error retrieving transactions:", error_1);
                res.status(500).json({ message: "Error retrieving transactions", error: error_1 });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.listTransactions = listTransactions;
/**
 * 🔹 Stripe 결제 요청 (클라이언트용)
 */
var createStripePaymentIntent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var amount, paymentIntent, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                amount = req.body.amount;
                if (!amount || amount <= 0) {
                    amount = 50;
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, stripe.paymentIntents.create({
                        amount: amount,
                        currency: "usd",
                        automatic_payment_methods: {
                            enabled: true,
                            allow_redirects: "never",
                        },
                    })];
            case 2:
                paymentIntent = _a.sent();
                res.json({ message: "Payment intent created", data: { clientSecret: paymentIntent.client_secret } });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("❌ Error creating Stripe payment intent:", error_2);
                res.status(500).json({ message: "Error creating stripe payment intent", error: error_2 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createStripePaymentIntent = createStripePaymentIntent;
/**
 * 🔹 트랜잭션 생성 (결제 성공 시 실행)
 */
var createTransaction = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, courseId, transactionId, amount, paymentProvider, course_1, createdTransaction, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, userId = _a.userId, courseId = _a.courseId, transactionId = _a.transactionId, amount = _a.amount, paymentProvider = _a.paymentProvider;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.course.findUnique({
                        where: { courseId: courseId },
                        include: { sections: { include: { chapters: true } } },
                    })];
            case 2:
                course_1 = _b.sent();
                if (!course_1) {
                    res.status(404).json({ message: "Course not found" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var newTransaction, newProgress;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.transaction.create({
                                        data: {
                                            transactionId: transactionId,
                                            userId: userId,
                                            courseId: courseId,
                                            amount: amount,
                                            paymentProvider: paymentProvider,
                                            dateTime: new Date(),
                                        },
                                    })];
                                case 1:
                                    newTransaction = _a.sent();
                                    return [4 /*yield*/, tx.userCourseProgress.create({
                                            data: {
                                                userId: userId,
                                                courseId: courseId,
                                                enrollmentDate: new Date(),
                                                overallProgress: 0,
                                                lastAccessedTimestamp: new Date(),
                                                sections: JSON.stringify(course_1.sections.map(function (section) { return ({
                                                    sectionId: section.sectionId,
                                                    chapters: section.chapters.map(function (chapter) { return ({
                                                        chapterId: chapter.chapterId,
                                                        completed: false,
                                                    }); }),
                                                }); })),
                                            },
                                        })];
                                case 2:
                                    newProgress = _a.sent();
                                    // 3️⃣ 수강 기록 추가 (Enrollment)
                                    return [4 /*yield*/, tx.enrollment.create({
                                            data: {
                                                userId: userId,
                                                courseId: courseId,
                                                enrolledAt: new Date(),
                                            },
                                        })];
                                case 3:
                                    // 3️⃣ 수강 기록 추가 (Enrollment)
                                    _a.sent();
                                    return [2 /*return*/, { transaction: newTransaction, progress: newProgress }];
                            }
                        });
                    }); })];
            case 3:
                createdTransaction = _b.sent();
                res.json({ message: "Purchased Course successfully", data: createdTransaction });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                console.error("❌ Error creating transaction and enrollment:", error_3);
                res.status(500).json({ message: "Error creating transaction and enrollment", error: error_3 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createTransaction = createTransaction;
