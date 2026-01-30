import React from "react";
import DataTable from "react-data-table-component";
import { Spin } from "antd";
import { getCustomTableStyles } from "./tableStyles";

const ReusableTable = ({
  columns,
  data,
  loading,
  title,
  customStyles,
  pagination = true,
  paginationRowsPerPageOptions = [10, 25, 50, 100],
  highlightOnHover = true,
  responsive = true,
  noDataMessage = "There are no records to display.",
  fixedHeader = false,
  fixedHeaderScrollHeight = "auto",
}) => {
  const NoDataComponent = () => (
    <div className="text-center py-4">
      <p className="text-gray-600">{noDataMessage}</p>
    </div>
  );

  // const defaultStyles = {
  //   headCells: {
  //     style: {
  //       backgroundColor: "#FF8096",
  //       color: "#fff",
  //       fontWeight: "bold",
  //     },
  //   },
  // };


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
        backgroundColor: "#FF8096",
        color: "#fff",
        fontWeight: "bold",
        position: 'sticky',
        top: 0,
        zIndex: 1,
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


  const tableStyles = getCustomTableStyles(customStyles);

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          paginationRowsPerPageOptions={paginationRowsPerPageOptions}
          highlightOnHover={highlightOnHover}
          responsive={responsive}
          noDataComponent={<NoDataComponent />}
          customStyles={defaultStyles}
          fixedHeader={fixedHeader}
          fixedHeaderScrollHeight={fixedHeaderScrollHeight}
        />
      )}
    </div>
  );
};

export default ReusableTable;