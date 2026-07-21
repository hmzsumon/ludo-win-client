"use client";

/* ────────── imports ────────── */
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Edit3,
  KeyRound,
  Mail,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";

/*
 * Registration page-এ ব্যবহৃত একই country drawer ও country list দিন।
 * প্রয়োজনে শুধু এই দুইটি import path পরিবর্তন করবেন।
 */
import { countries, type CountryOption } from "@/components/auth/countries";
import CountrySelectDrawer from "@/components/auth/country-select-drawer";

import {
  useResetForgotPasswordMutation,
  useSendResetCodeMutation,
  useVerifyResetCodeMutation,
} from "@/redux/features/auth/authApi";

/* ────────── types ────────── */

type ResetChannel = "sms" | "email";

type ContactValues = {
  phone: string;
  email: string;
};

type PasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

/* ────────── constants ────────── */

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const BANGLADESH: CountryOption = countries.find(
  (country) => country.iso === "BD",
) || {
  name: "Bangladesh",
  iso: "BD",
  dialCode: "+880",
  flag: "🇧🇩",
};

/* ────────── helpers ────────── */

function getApiError(error: any): string {
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function createInternationalPhone(
  countryCode: string,
  localNumber: string,
): string {
  const code = onlyDigits(countryCode);
  let number = onlyDigits(localNumber);

  while (number.startsWith("0")) {
    number = number.slice(1);
  }

  return `+${code}${number}`;
}

function maskDestination(channel: ResetChannel, destination: string): string {
  if (channel === "sms") {
    if (destination.length <= 7) {
      return destination;
    }

    return `${destination.slice(0, 5)}••••${destination.slice(-4)}`;
  }

  const [name, domain] = destination.split("@");

  if (!name || !domain) {
    return destination;
  }

  const visibleName =
    name.length <= 2
      ? `${name.charAt(0)}•`
      : `${name.slice(0, 2)}${"•".repeat(Math.min(name.length - 2, 5))}`;

  return `${visibleName}@${domain}`;
}

/* ────────── OTP input component ────────── */

interface OtpBoxesProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

function OtpBoxes({
  value,
  onChange,
  error,
  disabled,
}: OtpBoxesProps): JSX.Element {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigit = (index: number, digit: string) => {
    const nextValue = [...value];
    nextValue[index] = digit;
    onChange(nextValue);
  };

  const handleChange = (index: number, rawValue: string) => {
    const digit = onlyDigits(rawValue).slice(-1);

    updateDigit(index, digit);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (value[index]) {
        updateDigit(index, "");
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();

        const nextValue = [...value];
        nextValue[index - 1] = "";
        onChange(nextValue);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = onlyDigits(event.clipboardData.getData("text")).slice(
      0,
      OTP_LENGTH,
    );

    if (!pastedCode) {
      return;
    }

    const nextValue = Array.from(
      { length: OTP_LENGTH },
      (_, index) => pastedCode[index] || "",
    );

    onChange(nextValue);

    const focusIndex = Math.min(pastedCode.length, OTP_LENGTH - 1);

    requestAnimationFrame(() => {
      inputRefs.current[focusIndex]?.focus();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={value[index] || ""}
            disabled={disabled}
            onPaste={handlePaste}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`OTP digit ${index + 1}`}
            className={`h-14 min-w-0 flex-1 rounded-xl border text-center text-2xl font-black text-white shadow-inner outline-none transition sm:h-16 sm:max-w-[62px] ${
              error
                ? "border-red-400 bg-red-500/10 focus:border-red-300"
                : value[index]
                  ? "border-cyan-300 bg-cyan-400/15 shadow-[0_0_18px_rgba(34,211,238,0.15)]"
                  : "border-white/15 bg-[#26377c]/90 focus:border-cyan-300 focus:bg-[#2d438f]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-center text-xs font-bold text-red-400">
          {error}
        </p>
      ) : (
        <p className="mt-3 text-center text-[11px] text-white/45">
          Enter or paste the 6-digit verification code
        </p>
      )}
    </div>
  );
}

/* ────────── main component ────────── */

export default function ForgotPasswordForm(): JSX.Element {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedCountry, setSelectedCountry] =
    useState<CountryOption>(BANGLADESH);

  const [isCountryDrawerOpen, setIsCountryDrawerOpen] = useState(false);

  const [channel, setChannel] = useState<ResetChannel>("sms");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );

  const [otpError, setOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [sendResetCode, { isLoading: isSending }] = useSendResetCodeMutation();

  const [verifyResetCode, { isLoading: isVerifying }] =
    useVerifyResetCodeMutation();

  const [resetForgotPassword, { isLoading: isResetting }] =
    useResetForgotPasswordMutation();

  const contactForm = useForm<ContactValues>({
    mode: "onTouched",
    defaultValues: {
      phone: "",
      email: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    mode: "onTouched",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isBangladesh = selectedCountry.iso === "BD";

  const destination = channel === "sms" ? phone : email;

  const maskedDestination = useMemo(
    () => maskDestination(channel, destination),
    [channel, destination],
  );

  /* ────────── resend timer ────────── */

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCountdown]);

  /* ────────── select country ────────── */

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setIsCountryDrawerOpen(false);

    contactForm.clearErrors();
    contactForm.setValue("phone", "");
    contactForm.setValue("email", "");
  };

  /* ────────── send reset code ────────── */

  const handleSendCode = async (data: ContactValues) => {
    try {
      contactForm.clearErrors();

      if (isBangladesh) {
        const localPhone = onlyDigits(data.phone);

        if (!/^1[3-9]\d{8}$/.test(localPhone)) {
          contactForm.setError("phone", {
            type: "manual",
            message: "Enter a valid number without +880 or the first zero",
          });

          return;
        }

        const fullPhone = createInternationalPhone(
          selectedCountry.dialCode,
          localPhone,
        );

        const response = await sendResetCode({
          channel: "sms",
          phone: fullPhone,
        }).unwrap();

        setChannel("sms");
        setPhone(fullPhone);
        setEmail("");
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        setResendCountdown(RESEND_SECONDS);
        setStep(2);

        toast.success(response?.message || "SMS code sent successfully");

        return;
      }

      const normalizedEmail = data.email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        contactForm.setError("email", {
          type: "manual",
          message: "Enter your registered email address",
        });

        return;
      }

      const response = await sendResetCode({
        channel: "email",
        email: normalizedEmail,
      }).unwrap();

      setChannel("email");
      setEmail(normalizedEmail);
      setPhone("");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendCountdown(RESEND_SECONDS);
      setStep(2);

      toast.success(response?.message || "Email code sent successfully");
    } catch (error: any) {
      const message = getApiError(error);

      if (isBangladesh) {
        contactForm.setError("phone", {
          type: "server",
          message,
        });
      } else {
        contactForm.setError("email", {
          type: "server",
          message,
        });
      }

      toast.error(message);
    }
  };

  /* ────────── verify reset code ────────── */

  const handleVerifyCode = async () => {
    try {
      setOtpError("");

      const otp = otpDigits.join("");

      if (!/^\d{6}$/.test(otp)) {
        setOtpError("Please enter the complete 6-digit code");
        return;
      }

      const response = await verifyResetCode({
        channel,
        phone: channel === "sms" ? phone : undefined,
        email: channel === "email" ? email : undefined,
        otp,
      }).unwrap();

      setResetToken(response.resetToken);
      setStep(3);

      toast.success(response?.message || "Code verified successfully");
    } catch (error: any) {
      const message = getApiError(error);

      setOtpError(message);
      toast.error(message);
    }
  };

  /* ────────── resend reset code ────────── */

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isSending) {
      return;
    }

    try {
      const response = await sendResetCode({
        channel,
        phone: channel === "sms" ? phone : undefined,
        email: channel === "email" ? email : undefined,
      }).unwrap();

      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setResendCountdown(RESEND_SECONDS);

      toast.success(response?.message || "A new code has been sent");
    } catch (error: any) {
      toast.error(getApiError(error));
    }
  };

  /* ────────── reset password ────────── */

  const handleResetPassword = async (data: PasswordValues) => {
    try {
      const response = await resetForgotPassword({
        channel,
        phone: channel === "sms" ? phone : undefined,
        email: channel === "email" ? email : undefined,
        newPassword: data.newPassword,
        resetToken,
      }).unwrap();

      toast.success(response?.message || "Password reset successfully");

      setStep(1);
      setChannel("sms");
      setSelectedCountry(BANGLADESH);
      setPhone("");
      setEmail("");
      setResetToken("");
      setOtpError("");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setResendCountdown(0);

      contactForm.reset();
      passwordForm.reset();
    } catch (error: any) {
      const message = getApiError(error);

      passwordForm.setError("newPassword", {
        type: "server",
        message,
      });

      toast.error(message);
    }
  };

  /* ────────── return to contact form ────────── */

  const handleEditDestination = () => {
    setStep(1);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResetToken("");
    setResendCountdown(0);
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      {/* ────────── logo ────────── */}

      <div className="mt-1 scale-[0.82] sm:scale-95">
        <Logo />
      </div>

      {/* ────────── heading ────────── */}

      <div className="mt-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_25px_rgba(34,211,238,0.12)]">
          {step === 1 ? (
            <KeyRound className="h-6 w-6 text-cyan-300" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
          )}
        </div>

        <h1 className="mt-4 text-2xl font-black text-white">
          {step === 1
            ? "Forgot Password"
            : step === 2
              ? "Verify Your Code"
              : "Create New Password"}
        </h1>

        <p className="mx-auto mt-2 max-w-[430px] text-xs leading-6 text-white/65">
          {step === 1
            ? "Bangladesh users receive an SMS code. Users from other countries receive a secure code by email."
            : step === 2
              ? "Enter the verification code we sent to your account."
              : "Choose a strong password that you have not used before."}
        </p>
      </div>

      {/* ────────── form card ────────── */}

      <div className="mt-7 w-full rounded-2xl border border-white/10 bg-[#142967]/45 px-3 py-5 shadow-[0_22px_70px_rgba(1,13,54,0.28)] backdrop-blur-md ">
        {/* ────────── step one ────────── */}

        {step === 1 ? (
          <form
            onSubmit={contactForm.handleSubmit(handleSendCode)}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="mb-2.5 block text-xs font-black uppercase tracking-[0.12em] text-cyan-300">
                Country
              </label>

              <button
                type="button"
                onClick={() => setIsCountryDrawerOpen(true)}
                className="flex h-16 w-full items-center gap-3 rounded-2xl border border-white/15 bg-[#26377c]/95 px-4 text-left shadow-inner outline-none transition hover:border-cyan-300/60"
              >
                <span className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/10 text-2xl">
                  {selectedCountry.flag}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-white">
                    {selectedCountry.name}
                  </span>

                  <span className="mt-0.5 block text-xs font-bold text-cyan-300">
                    {selectedCountry.dialCode}
                  </span>
                </span>

                <ChevronDown className="h-5 w-5 shrink-0 text-white/45" />
              </button>
            </div>

            {isBangladesh ? (
              <div>
                <label className="mb-2.5 block text-xs font-black uppercase tracking-[0.12em] text-cyan-300">
                  Mobile Number
                </label>

                <div
                  className={`flex h-16 overflow-hidden rounded-2xl border bg-[#26377c]/95 shadow-inner transition focus-within:border-cyan-300 ${
                    contactForm.formState.errors.phone
                      ? "border-red-400"
                      : "border-white/15"
                  }`}
                >
                  <div className="flex min-w-[122px] shrink-0 items-center justify-center gap-2 border-r border-white/15 px-3">
                    <span className="text-xl">{selectedCountry.flag}</span>

                    <span className="font-black text-white">
                      {selectedCountry.dialCode}
                    </span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="1710000000"
                    className="min-w-0 flex-1 bg-transparent px-4 text-lg font-black text-white outline-none placeholder:text-white/30"
                    {...contactForm.register("phone", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^1[3-9]\d{8}$/,
                        message: "Enter number without +880 or the first zero",
                      },
                      onChange: (event) => {
                        event.target.value = onlyDigits(
                          event.target.value,
                        ).slice(0, 10);
                      },
                    })}
                  />
                </div>

                {contactForm.formState.errors.phone?.message ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-400">
                    {contactForm.formState.errors.phone.message}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-white/40">
                    Example: 1716091155
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-2.5 block text-xs font-black uppercase tracking-[0.12em] text-cyan-300">
                  Registered Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-cyan-300" />

                  <AuthInput
                    type="email"
                    placeholder="Enter your registered email"
                    error={contactForm.formState.errors.email?.message}
                    className="pl-12"
                    {...contactForm.register("email", {
                      required: "Registered email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3.5">
              <div className="flex gap-3">
                {isBangladesh ? (
                  <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                ) : (
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                )}

                <p className="text-xs leading-5 text-white/65">
                  {isBangladesh
                    ? "A 6-digit security code will be sent to this Bangladesh mobile number."
                    : `A 6-digit security code will be sent by email for ${selectedCountry.name}.`}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#72ff13_0%,#35d40c_52%,#0bb512_100%)] text-xl font-black text-white shadow-[0_10px_28px_rgba(31,218,13,0.25)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  {isBangladesh ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <Mail className="h-5 w-5" />
                  )}

                  {isBangladesh ? "Send SMS Code" : "Send Email Code"}
                </>
              )}
            </button>
          </form>
        ) : null}

        {/* ────────── step two ────────── */}

        {step === 2 ? (
          <div>
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10">
                  {channel === "sms" ? (
                    <span className="text-2xl">{selectedCountry.flag}</span>
                  ) : (
                    <Mail className="h-5 w-5 text-cyan-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Code sent to
                  </p>

                  <p className="mt-1 truncate text-sm font-black text-cyan-300">
                    {maskedDestination}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEditDestination}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/65 transition hover:border-cyan-300/40 hover:text-cyan-300"
                  aria-label="Edit destination"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <OtpBoxes
                value={otpDigits}
                onChange={(value) => {
                  setOtpDigits(value);

                  if (otpError) {
                    setOtpError("");
                  }
                }}
                error={otpError}
                disabled={isVerifying}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={isVerifying}
              className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#72ff13_0%,#35d40c_52%,#0bb512_100%)] text-xl font-black text-white shadow-[0_10px_28px_rgba(31,218,13,0.25)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Verify Code
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-white/50">
                Didn&apos;t receive the code?
              </p>

              <button
                type="button"
                disabled={resendCountdown > 0 || isSending}
                onClick={handleResendCode}
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-cyan-300 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:text-white/35"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isSending ? "animate-spin" : ""}`}
                />

                {isSending
                  ? "Sending..."
                  : resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : "Resend Code"}
              </button>
            </div>
          </div>
        ) : null}

        {/* ────────── step three ────────── */}

        {step === 3 ? (
          <form
            onSubmit={passwordForm.handleSubmit(handleResetPassword)}
            className="flex flex-col gap-5"
          >
            <div className="rounded-2xl border border-green-300/20 bg-green-300/[0.07] p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-300" />

                <div>
                  <p className="text-sm font-black text-white">
                    Verification successful
                  </p>

                  <p className="mt-1 text-xs text-white/55">
                    You can now create a new password.
                  </p>
                </div>
              </div>
            </div>

            <AuthInput
              type="password"
              placeholder="New Password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <AuthInput
              type="password"
              placeholder="Confirm New Password"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register("confirmPassword", {
                required: "Confirm new password is required",
                validate: (value) =>
                  value === passwordForm.watch("newPassword") ||
                  "Passwords do not match",
              })}
            />

            <button
              type="submit"
              disabled={isResetting}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#72ff13_0%,#35d40c_52%,#0bb512_100%)] text-xl font-black text-white shadow-[0_10px_28px_rgba(31,218,13,0.25)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        ) : null}
      </div>

      {/* ────────── sign in button ────────── */}

      <Link
        href="/login"
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] text-sm font-black text-white transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.06]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign In
      </Link>

      {/* ────────── country drawer ────────── */}

      <CountrySelectDrawer
        open={isCountryDrawerOpen}
        selectedCountry={selectedCountry}
        countries={countries}
        onClose={() => setIsCountryDrawerOpen(false)}
        onSelect={handleCountrySelect}
      />
    </div>
  );
}
