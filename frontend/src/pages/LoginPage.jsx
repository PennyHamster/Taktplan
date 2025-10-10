import React from 'react';
import {
  LoginPageContainer,
  LoginForm,
  Title,
  Input,
  Button,
  ErrorMessage
} from './LoginPage.styles';

const LoginPage = () => {
  return (
    <LoginPageContainer>
      <LoginForm>
        <Title>Login</Title>
        <Input type="email" placeholder="E-Mail" />
        <Input type="password" placeholder="Passwort" />
        <Button>Anmelden</Button>
        {/* <ErrorMessage>Fehlermeldung hier</ErrorMessage> */}
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;