import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { env } from "next-runtime-env";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@kan/auth/client";

import { Auth } from "~/components/AuthForm";
import { PageHead } from "~/components/PageHead";
import PatternedBackground from "~/components/PatternedBackground";

export default function LoginPage() {
  const router = useRouter();
  const isSignUpDisabled = env("NEXT_PUBLIC_DISABLE_SIGN_UP") === "true";
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [magicLinkRecipient, setMagicLinkRecipient] = useState<string>("");

  const searchParams = useSearchParams();
  const redirect = searchParams.get("next");
  const oidcError = searchParams.get("error");

  const handleMagicLinkSent = (value: boolean, recipient: string) => {
    setIsMagicLinkSent(value);
    setMagicLinkRecipient(recipient);
  };

  const { data, isPending } = authClient.useSession();

  if (data?.user.id) router.push(redirect ?? "/boards");

  // PdLime: with NEXT_PUBLIC_OIDC_AUTO_SIGN_IN=true, skip this page and start
  // the OIDC sign-in straight away. Behind the PdLime edge the person is
  // already signed in to Authentik, so the round trip is silent. An `error`
  // query parameter (a failed round trip) shows the normal page instead, so a
  // failure can't loop.
  const isOidcAutoSignIn =
    env("NEXT_PUBLIC_OIDC_AUTO_SIGN_IN")?.toLowerCase() === "true" &&
    !oidcError;
  const oidcStarted = useRef(false);
  const [oidcFailed, setOidcFailed] = useState(false);

  useEffect(() => {
    if (!isOidcAutoSignIn || isPending || data?.user.id) return;
    if (oidcStarted.current) return;
    oidcStarted.current = true;
    void authClient.signIn
      .oauth2({
        providerId: "oidc",
        callbackURL: redirect ?? "/boards",
        errorCallbackURL: "/login?error=oidc",
      })
      .then((result) => {
        if (result.error) setOidcFailed(true);
      });
  }, [isOidcAutoSignIn, isPending, data?.user.id, redirect]);

  if (isOidcAutoSignIn && !oidcFailed) {
    return (
      <>
        <PageHead title={t`Login | kan.bn`} />
        <main className="flex h-screen items-center justify-center bg-light-100 dark:bg-dark-50">
          <p className="text-sm text-light-1000 dark:text-dark-1000">
            Signing in…
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHead title={t`Login | kan.bn`} />
      <main className="h-screen bg-light-100 pt-20 dark:bg-dark-50 sm:pt-0">
        <div className="justify-top flex h-full flex-col items-center px-4 sm:justify-center">
          <div className="z-10 flex w-full flex-col items-center">
            <Link href="/">
              <h1 className="mb-6 text-lg font-bold tracking-tight text-light-1000 dark:text-dark-1000">
                kan.bn
              </h1>
            </Link>
            <p className="mb-10 text-3xl font-bold tracking-tight text-light-1000 dark:text-dark-1000">
              {isMagicLinkSent ? t`Check your inbox` : t`Welcome back`}
            </p>
            {isMagicLinkSent ? (
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <p className="text-md mt-2 text-center text-light-1000 dark:text-dark-1000">
                  <Trans>
                    Click on the link we've sent to {magicLinkRecipient} to sign
                    in.
                  </Trans>
                </p>
              </div>
            ) : (
              <div className="w-full rounded-lg border border-light-500 bg-light-300 px-4 py-10 dark:border-dark-400 dark:bg-dark-200 sm:max-w-md lg:px-10">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                  <Auth setIsMagicLinkSent={handleMagicLinkSent} />
                </div>
              </div>
            )}
            {(!isSignUpDisabled || redirect?.startsWith("/invite/")) && (
              <p className="mt-4 text-sm text-light-1000 dark:text-dark-1000">
                <Trans>
                  Don't have an account?{" "}
                  <span className="underline">
                    <Link
                      href={redirect ? `/signup?next=${redirect}` : "/signup"}
                    >
                      Sign up
                    </Link>
                  </span>
                </Trans>
              </p>
            )}
          </div>
          <PatternedBackground />
        </div>
      </main>
    </>
  );
}
