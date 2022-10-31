/* eslint-disable no-unused-expressions */
import * as React from 'react';

export const navigationRef = React.createRef();

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};

export const dispatch = params => {
  navigationRef.current?.dispatch(params);
};
