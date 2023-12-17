// VerticalStepper.js

import { Box, HStack, VStack } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon } from '@chakra-ui/icons';

interface VerticalStepperProps {
  isSenderCompleted: boolean;
  isReceiverCompleted: boolean;
  isRatesCompleted: boolean;
  selectedSectionFromParent: number;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  isSenderCompleted,
  isReceiverCompleted,
  isRatesCompleted,
  selectedSectionFromParent,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([
    {
      label: 'Sender',
      isCompleted: false,
    },
    {
      label: 'Receiver',
      isCompleted: false,
    },
    {
      label: 'Items',
      isCompleted: false,
    },
    {
      label: 'Package',
      isCompleted: false,
    },
    {
      label: 'Rates',
      isCompleted: false,
    },
  ]);

  useEffect(() => {
    setActiveStep(selectedSectionFromParent);
  }, [selectedSectionFromParent]);

  useEffect(() => {
    if (isSenderCompleted) {
      const newSteps = [...steps];
      newSteps[0].isCompleted = true;
      setSteps(newSteps);
    }
  }, [isSenderCompleted]);

  useEffect(() => {
    if (isReceiverCompleted) {
      const newSteps = [...steps];
      newSteps[1].isCompleted = true;
      setSteps(newSteps);
    }
  }, [isReceiverCompleted]);

  useEffect(() => {
    if (isRatesCompleted) {
      const newSteps = [...steps];
      newSteps[4].isCompleted = true;
      setSteps(newSteps);
    }
  }, [isRatesCompleted]);

  useEffect(() => {
    // Scroll to the corresponding section when active step changes
    const targetSection = document.getElementById(
      `section-${activeStep}`
    );
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeStep]);

  const handleStepClick = (index: any) => {
    setActiveStep(index);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '20px',
          marginLeft: '20px',
          opacity: '0',
        }}
      >
        <div
          className="scrolling"
          style={{
            // position: 'fixed',
            // top: '50%',
            right: '0',
            // transform: 'translateY(-50%)',
            // backgroundColor: '#fff',
            padding: '10px',
            // borderRadius: '5px',
            // boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 999,
          }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <>
                <HStack w={'100%'}>
                  <div
                    onClick={() => handleStepClick(index)}
                    style={{
                      cursor: 'pointer',
                      // marginBottom: '10px',
                      // padding: '8px',
                      borderRadius: '50%', // Make it a circle
                      // width: '40px', // Adjust the width as needed
                      // height: '40px', // Adjust the height as needed
                      width: '4rem',
                      height: '2.52rem',
                      fontWeight: 'bold',
                      backgroundColor:
                        activeStep === index ? '#FF4C02' : '#fff',
                      color: activeStep === index ? '#fff' : '#000',
                      border:
                        activeStep === index
                          ? '1px solid #FF4C02'
                          : '1px solid #E7E7E7',
                      position: 'relative', // Enable positioning for the lines
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {/* <CheckIcon /> */}
                    {index + 1}
                  </div>
                  <Box
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      margin: 'auto',
                      marginLeft: '10px',
                    }}
                  >
                    {step.label}
                  </Box>
                </HStack>
              </>

              {index < steps.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    height: '20px', // Adjust the height of the line
                    backgroundColor: '#ddd',
                    margin: '10px 0px 10px 19px', // Center the line
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '20px',
          marginLeft: '20px',
          position: 'fixed',
          top: '64px',
        }}
      >
        <div
          className="scrolling"
          style={{
            // position: 'fixed',
            // top: '50%',
            right: '0',
            // transform: 'translateY(-50%)',
            // backgroundColor: '#fff',
            padding: '10px',
            // borderRadius: '5px',
            // boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 999,
          }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <>
                <HStack w={'100%'}>
                  <div
                    onClick={() => handleStepClick(index)}
                    style={{
                      cursor: 'pointer',
                      // marginBottom: '10px',
                      // padding: '8px',
                      borderRadius: '50%', // Make it a circle
                      // width: '40px', // Adjust the width as needed
                      // height: '40px', // Adjust the height as needed
                      width: '4rem',
                      height: '2.52rem',
                      fontWeight: 'bold',
                      backgroundColor: step.isCompleted
                        ? '#FF4C02'
                        : activeStep === index
                        ? '#FFB79A'
                        : '#fff',
                      color: step.isCompleted
                        ? '#fff'
                        : activeStep === index
                        ? '#FF4C02'
                        : '#000',
                      border: step.isCompleted
                        ? '#FF4C02'
                        : activeStep === index
                        ? '1px solid #FF4C02'
                        : '1px solid #E7E7E7',
                      position: 'relative', // Enable positioning for the lines
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {step.isCompleted ? <CheckIcon /> : index + 1}
                  </div>
                  <Box
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      margin: 'auto',
                      marginLeft: '10px',
                    }}
                  >
                    {step.label}
                  </Box>
                </HStack>
              </>

              {index < steps.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    height: '20px', // Adjust the height of the line
                    backgroundColor: '#ddd',
                    margin: '10px 0px 10px 19px', // Center the line
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default VerticalStepper;
