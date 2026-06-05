/**
 * Represents the properties for the MockFile component.
 * * @typedef {Object} MockFileProps
 * @property {string} [initialTitle] - The initial title to display in the header.
 * @property {boolean} [startVisible] - Determines if the content is visible on first render.
 */

import React, { useState } from 'react';

/**
 * A simple mock component designed specifically to test the JSDoc folding extension.
 * It includes state management for visibility and title to simulate real-world usage.
 * * @param {MockFileProps} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered React component.
 */
export const MockFile = ({ initialTitle, startVisible = true }) => {
  const [title, setTitle] = useState(initialTitle || 'Default Title');
  const [isVisible, setIsVisible] = useState(startVisible);

  /**
   * Toggles the visibility state of the component's main content block.
   * This function does not take any parameters and directly mutates the state.
   * * @returns {void}
   */
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mock-file-container">
      <h1>{title}</h1>
      
      {isVisible && (
        <div className="content">
          <p>This is a mocked component content.</p>
        </div>
      )}

      <button onClick={toggleVisibility}>
        {isVisible ? 'Hide' : 'Show'} Content
      </button>
    </div>
  );
};

export default MockFile;