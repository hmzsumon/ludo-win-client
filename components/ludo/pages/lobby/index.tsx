import UserSidebar from "@/components/auth/UserSidebar";
import PageWrapper from "@/components/wrapper/page";
import BackButton from "../../backButton";
import Logo from "../../logo";
import { Alert, Options, Toolbar } from "./components";

const LoobyPage = () => {
  // TODO: Implementar contexto.
  const serviceError = false;
  const isAuth = false;

  return (
    <PageWrapper leftOption={<BackButton />}>
      <Logo />
      <Options serviceError={serviceError} />
      {serviceError && <Alert />}
      <Toolbar isAuth={isAuth} />

      <UserSidebar />
    </PageWrapper>
  );
};

export default LoobyPage;
