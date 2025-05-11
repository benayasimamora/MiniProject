-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('CUSTOMER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "Organizer_Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Voucher_Status" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "point_source" AS ENUM ('REFERRAL', 'REFUND', 'REDEEM', 'VERIFICATION', 'TRANSACTION_CANCEL_REFUND');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('WAITING_PAYMENT', 'PENDING', 'WAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'CUSTOMER',
    "referral_code" TEXT NOT NULL,
    "profile_picture" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizer_Profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_name" TEXT NOT NULL,
    "organization_email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "website_url" TEXT,
    "status_approval" "Organizer_Status" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,

    CONSTRAINT "Organizer_Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "referee_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Points" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "source" "point_source" NOT NULL,
    "expired_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupons" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "expired_at" TIMESTAMPTZ(6) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vouchers" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "status" "Voucher_Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "organizer_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "remaining_seats" INTEGER NOT NULL,
    "requires_organizer_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket_Type" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity_available" INTEGER NOT NULL,

    CONSTRAINT "Ticket_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'WAITING_PAYMENT',
    "gross_amount" INTEGER NOT NULL,
    "net_amount" INTEGER NOT NULL,
    "payment_proof" TEXT,
    "used_point_amount" INTEGER NOT NULL DEFAULT 0,
    "used_coupon_id" INTEGER,
    "used_voucher_id" INTEGER,
    "midtrans_order_id" TEXT,
    "midtrans_snap_token" TEXT,
    "midtrans_payment_type" TEXT,
    "midtrans_transaction_time" TIMESTAMP(3),
    "midtrans_settlement_time" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "payment_due_date" TIMESTAMP(3),
    "organizer_confirmation_due_date" TIMESTAMP(3),
    "organizer_confirmed_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions_Detail" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "ticket_type_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_ticket" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "Transactions_Detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_Profile_user_id_key" ON "Organizer_Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_Points_user_id_key" ON "User_Points"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_code_key" ON "Coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Vouchers_code_key" ON "Vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_midtrans_order_id_key" ON "Transactions"("midtrans_order_id");

-- CreateIndex
CREATE INDEX "Transactions_user_id_idx" ON "Transactions"("user_id");

-- CreateIndex
CREATE INDEX "Transactions_event_id_idx" ON "Transactions"("event_id");

-- CreateIndex
CREATE INDEX "Transactions_status_idx" ON "Transactions"("status");

-- CreateIndex
CREATE INDEX "Transactions_payment_due_date_idx" ON "Transactions"("payment_due_date");

-- CreateIndex
CREATE INDEX "Transactions_organizer_confirmation_due_date_idx" ON "Transactions"("organizer_confirmation_due_date");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_transaction_id_key" ON "Reviews"("transaction_id");

-- CreateIndex
CREATE INDEX "Reviews_user_id_idx" ON "Reviews"("user_id");

-- CreateIndex
CREATE INDEX "Reviews_event_id_idx" ON "Reviews"("event_id");

-- AddForeignKey
ALTER TABLE "Organizer_Profile" ADD CONSTRAINT "Organizer_Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referee_id_fkey" FOREIGN KEY ("referee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Points" ADD CONSTRAINT "User_Points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupons" ADD CONSTRAINT "Coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouchers" ADD CONSTRAINT "Vouchers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouchers" ADD CONSTRAINT "Vouchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket_Type" ADD CONSTRAINT "Ticket_Type_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_used_coupon_id_fkey" FOREIGN KEY ("used_coupon_id") REFERENCES "Coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_used_voucher_id_fkey" FOREIGN KEY ("used_voucher_id") REFERENCES "Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions_Detail" ADD CONSTRAINT "Transactions_Detail_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions_Detail" ADD CONSTRAINT "Transactions_Detail_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "Ticket_Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
