import { Container, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Input } from 'components/Input';
import { getAuth } from 'firebase/auth';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

const Styled = {
  FormContainer: styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  `,
  ButtonContainer: styled(Container)`
    margin-top: 2em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  `,
  OrangeButton: styled(Button),
};
function OnboardingPage({ setOrangeChicken, setCompletedOnboarding, ...props }) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  console.log(setOrangeChicken);
  const handleFormSubmit = async (data) => {
    console.log('updated');
    const auth = getAuth();
    data.email = auth.currentUser.email;
    console.log(data);
    // await setDoc(doc(db, 'users', auth.currentUser.email), {
    //   email: auth.currentUser.email,
    //   phoneNumber,
    //   food,
    // });
    setCompletedOnboarding(true);
  };

  const handleOrange = useCallback(
    (data) => {
      console.log(errors);
      setOrangeChicken(true);
      handleFormSubmit(data);
    },
    [setOrangeChicken],
  );
  return (
    <Styled.FormContainer component="main" maxWidth="sm">
      <Typography></Typography>
      <Input
        name="phoneNumber"
        control={control}
        helperText={errors?.phoneNumber ? 'Please enter a valid phone number' : ''}
        error={!!errors?.phoneNumber}
        rules={{ required: true, pattern: /\d{3}-?\d{3}-?\d{4}/ }}
        variant="standard"
      />
      <Styled.ButtonContainer>
        <Button type="submit" variant="contained" onClick={handleSubmit(handleOrange)}>
          Orange Chicken
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          onClick={handleSubmit(handleFormSubmit)}
        >
          Start from Scratch
        </Button>
      </Styled.ButtonContainer>
    </Styled.FormContainer>
  );
}

export default OnboardingPage;
