import styled from "@emotion/styled";
import { QUERIESV2 } from "utils";
import CardStepperItem from "./CardStepperItem";

export type Progress = "completed" | "awaiting" | "failed";

export type CardStepType = {
  buttonContent: React.ReactElement | string;
  buttonHandler: () => void;
  disableButton?: boolean;

  stepTitle: string;
  stepIcon?: React.ReactElement;
  completedText?: string;

  stepProgress: Progress;
};

type CardStepperParams = {
  steps: CardStepType[];
};

const CardStepper = ({ steps }: CardStepperParams) => {
  let pastCurrentStep = false;
  let failureEncountered = false;
  let previousState: Progress | "not_reached" | undefined = undefined;
  const stepElements = steps.map((step, stepNo) => {
    const isStepAwaiting = step.stepProgress === "awaiting";
    const isStepFailure = step.stepProgress === "failed";
    const isStepSuccess = step.stepProgress === "completed";

    const subHeader =
      isStepAwaiting || !step.completedText
        ? `Step ${stepNo + 1}`
        : step.completedText;

    const stepItem = (
      <CardStepperItem
        key={stepNo}
        subHeader={subHeader}
        buttonContent={step.buttonContent}
        buttonHandler={step.buttonHandler}
        disableButton={step.disableButton}
        title={step.stepTitle}
        progress={step.stepProgress}
        afterCurrent={pastCurrentStep}
        previousProgress={previousState}
        Icon={step.stepIcon}
      />
    );

    // Enable the failed encounter if this step is a failure
    failureEncountered = failureEncountered || isStepFailure;
    // Determine the most recent
    previousState = pastCurrentStep ? "not_reached" : step.stepProgress;
    pastCurrentStep = pastCurrentStep || !isStepSuccess;
    return stepItem;
  });

  return <StepperWrapper>{stepElements}</StepperWrapper>;
};

export default CardStepper;

const StepperWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 16px;
  padding-top: 32px;

  @media ${QUERIESV2.tb.andDown} {
    padding-left: 12px;
  }

  background-color: #34353b;

  &:before {
    content: "";
    background-color: #34353b;
    position: absolute;
    height: 200%;
    width: 300%;
    left: -100%;
    z-index: -1;
    top: 0;
  }
  // Need to discuss with Tim about precise breakpoints
  @media screen and (max-width: 624px) {
    padding-left: 0;
  }
`;
