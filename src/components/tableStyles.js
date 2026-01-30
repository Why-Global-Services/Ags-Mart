// tableStyles.js
export const getCustomTableStyles = (options = {}) => {
    const defaultStyles = {
      head: {
        style: {
          backgroundColor: "#FF8096",
          color: "#fff",
          fontWeight: "bold",
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
      },
      headRow: {
        style: {
          minHeight: '56px',
        },
      },
      headCells: {
        style: {
          paddingLeft: '8px',
          paddingRight: '8px',
        },
      },
      cells: {
        style: {
          paddingLeft: '8px',
          paddingRight: '8px',
        },
      },
      rows: {
        style: {
          minHeight: '48px',
          '&:not(:last-of-type)': {
            borderBottom: '1px solid #eee',
          },
        },
        highlightOnHoverStyle: {
          backgroundColor: '#f5f5f5',
          transitionDuration: '0.15s',
          transitionProperty: 'background-color',
          outlineStyle: 'none',
        },
      },
    };
  
    // Merge with any custom options
    return {
      ...defaultStyles,
      ...options,
    };
  };