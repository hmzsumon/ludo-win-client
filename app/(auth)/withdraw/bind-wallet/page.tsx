"use client";

import NagadLogo from "@/public/images/deposit/nagad-logo.png";
import { useAddUserPaymentMethodMutation } from "@/redux/features/auth/authApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PaymentBrandIcon from "../../deposit/payment/components/BkashIcon";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AccountNumberField from "./components/AccountNumberField";
import PasswordSection from "./components/PasswordSection";
import ReadonlyField from "./components/ReadonlyField";
import TextField from "./components/TextField";
import TopAppBar from "./components/TopAppBar";
import WalletGroupSelector from "./components/WalletGroupSelector";

export type WalletGroup = "bkash" | "nagad";

const PANEL = {
  background:
    "linear-gradient(180deg, rgba(67,11,88,0.55) 0%, rgba(20,4,31,0.75) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const BindWalletPage: React.FC = () => {
  const router = useRouter();
  const [addUserPaymentMethod] = useAddUserPaymentMethodMutation();
  const { user } = useSelector((state: any) => state.auth);

  const [group, setGroup] = useState<WalletGroup>("bkash");
  const [fullName, setFullName] = useState("");
  const [account, setAccount] = useState("");
  const [txPass, setTxPass] = useState("");
  const [txPass2, setTxPass2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const ewalletType = group === "bkash" ? "BKash" : "Nagad";

  const nameErr =
    fullName.trim().length < 3 ? "Enter payee full name (min 3 chars)" : "";

  const accErr = /^\d{11}$/.test(account)
    ? ""
    : "11-digit account number required";

  const passErr = /^\d{6}$/.test(txPass)
    ? ""
    : "Transaction password must be 6 digits";

  const matchErr =
    txPass && txPass2 && txPass !== txPass2 ? "Passwords do not match" : "";

  const isValid = useMemo(
    () =>
      !nameErr &&
      !accErr &&
      !passErr &&
      !matchErr &&
      !!fullName &&
      !!account &&
      !!txPass,
    [nameErr, accErr, passErr, matchErr, fullName, account, txPass],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await addUserPaymentMethod({
        name: fullName,
        method: group,
        accountNumber: account,
        txPassword: txPass,
      }).unwrap();

      toast.success("E-wallet bound successfully!");
      router.push("/withdraw");
    } catch (error) {
      toast.error(
        (error as fetchBaseQueryError).data?.error || "Something went wrong!",
      );
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "#14041f" }}>
      <TopAppBar title="Bind E-wallet" onBack={() => history.back()} />

      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-md space-y-3 px-3 py-5"
      >
        <div className="rounded-2xl p-4" style={PANEL}>
          <WalletGroupSelector
            group={group}
            onChange={setGroup}
            bkashIcon={<PaymentBrandIcon title="BKash" imageSize={28} />}
            nagadIcon={
              <PaymentBrandIcon
                title="Nagad"
                logoSrc={NagadLogo}
                alt="Nagad Logo"
                bgClassName="bg-[#E51B23]"
                imageSize={28}
              />
            }
          />

          <ReadonlyField label="E-wallet type" value={ewalletType} />
        </div>

        <div className="rounded-2xl p-4" style={PANEL}>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Account Info
            </span>
          </div>

          <TextField
            label="* Full name of the payee"
            value={fullName}
            onChange={setFullName}
            placeholder="Enter full name"
            leftIcon="user"
            helperText="Ensure the name matches your financial provider account exactly. Once submitted, it cannot be changed."
            error={nameErr && fullName ? nameErr : ""}
          />

          <AccountNumberField
            label={`* ${ewalletType} account number`}
            value={account}
            onChange={setAccount}
            placeholder="01XXXXXXXXX"
            error={account && accErr ? accErr : ""}
          />
        </div>

        <div className="rounded-2xl p-4" style={PANEL}>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Security
            </span>
          </div>

          <PasswordSection
            txPass={txPass}
            txPass2={txPass2}
            onChangeTxPass={setTxPass}
            onChangeTxPass2={setTxPass2}
            show1={show1}
            show2={show2}
            onToggle1={() => setShow1((v) => !v)}
            onToggle2={() => setShow2((v) => !v)}
            passErr={txPass && passErr ? passErr : ""}
            matchErr={matchErr}
            hasTnxPassword={!!user?.hasTnxPassword}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-widest transition-all duration-200"
          style={{
            background: isValid
              ? "linear-gradient(135deg, #9333ea, #7c3aed)"
              : "rgba(255,255,255,0.06)",
            color: isValid ? "#fff" : "rgba(255,255,255,0.25)",
            boxShadow: isValid ? "0 4px 20px rgba(147,51,234,0.5)" : "none",
            border: isValid ? "none" : "1px solid rgba(255,255,255,0.06)",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          {isValid ? "Bind E-wallet →" : "Fill all fields to continue"}
        </button>
      </form>
    </div>
  );
};

export default BindWalletPage;
