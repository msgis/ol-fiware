import React from 'react';
import Button from 'react-bootstrap/Button';
import { ArrowClockwise, ExclamationDiamond, CheckCircle } from 'react-bootstrap-icons';

import './StateButton.css';

const icons = {
  success: CheckCircle,
  danger: ExclamationDiamond,
  loading: ArrowClockwise
};

export default function StateButton({ children, state, variant, ...props }) {

  const Icon = icons[state];

  if (state && state !== 'loading') {
    variant = state;
  }

  return (
    <>
      <Button variant={variant} {...props} >
        {children}
        {Icon ? <Icon className="state-button-icon" /> : null}
      </Button>
    </>
  );
}
