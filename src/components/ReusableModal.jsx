// import React from "react";
// import { Modal } from "antd";
// import dayjs from "dayjs";

// const ReusableModal = ({
//   isOpen,
//   onClose,
//   title,
//   data,
//   fields,
//   imageConfig = {
//     show: true,
//     path: "image",
//     alt: "title",
//   },
// }) => {
//   if (!data) return null;

//   return (
//     <Modal
//       title={title || "Details"}
//       open={isOpen}
//       onCancel={onClose}
//       footer={null}
//       width={600}
//     >
//       <div className="p-4">
//         {imageConfig.show && data[imageConfig.path] && (
//           <div className="flex justify-center mb-4">
//             <img
//               src={data[imageConfig.path]}
//               alt={data[imageConfig.alt] || "Image"}
//               className="w-32 h-32 object-cover rounded-md"
//             />
//           </div>
//         )}
//         <div className="grid grid-cols-2 gap-4">
//           {fields.map((field) => (
//             <React.Fragment key={field.key}>
//               <p className="font-semibold">{field.label}:</p>
//               <p>
//                 {field.type === "date"
//                   ? dayjs(data[field.key]).format("DD/MM/YYYY")
//                   : field.type === "percentage"
//                   ? `${data[field.key]}%`
//                   : field.type === "status" 
//                   ? <span className={`px-2 py-1 rounded-full text-xs ${
//                       data[field.key] === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                     }`}>
//                       {data[field.key]}
//                     </span>
//                   : data[field.key]}
//               </p>
//             </React.Fragment>
//           ))}
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default ReusableModal;


// import React from "react";
// import { Modal } from "antd";
// import dayjs from "dayjs";

// const ReusableModal = ({
//   isOpen,
//   onClose,
//   title,
//   data,
//   fields,
//   imageConfig = {
//     show: true,
//     path: "image",
//     alt: "title",
//   },
// }) => {
//   if (!data) return null;

//   // Helper function to get nested property safely
//   const getNestedProperty = (obj, path) => {
//     return path.split(".").reduce((current, key) => {
//       return current && current[key] ? current[key] : null;
//     }, obj);
//   };

//   return (
//     <Modal
//       title={title || "Details"}
//       open={isOpen}
//       onCancel={onClose}
//       footer={null}
//       width={600}
//     >
//       <div className="p-4">
//         {imageConfig.show && (
//           <div className="flex justify-center mb-4">
//             {imageConfig.render ? (
//               imageConfig.render(getNestedProperty(data, imageConfig.path) || [])
//             ) : (
//               getNestedProperty(data, imageConfig.path) && (
//                 <img
//                   src={getNestedProperty(data, imageConfig.path)}
//                   alt={data[imageConfig.alt] || "Image"}
//                   className="w-32 h-32 object-cover rounded-md"
//                 />
//               )
//             )}
//           </div>
//         )}
//         <div className="grid grid-cols-2 gap-4">
//           {fields.map((field) => {
//             // Skip rendering if showIf condition is not met
//             if (field.showIf && !field.showIf(data)) {
//               return null;
//             }

//             const rawValue = field.render
//               ? field.render(getNestedProperty(data, field.key))
//               : getNestedProperty(data, field.key);

//             // Apply format function if provided, otherwise use rawValue
//             const value = field.format
//               ? field.format(rawValue, data)
//               : rawValue;

//             return (
//               <React.Fragment key={field.key}>
//                 <p className="font-semibold">{field.label}:</p>
//                 <p>
//                   {field.type === "date" && value
//                     ? dayjs(value).format("DD/MM/YYYY")
//                     : field.type === "percentage" && value
//                     ? `${value}%`
//                     : field.type === "currency" && value
//                     ? `₹${value}`
//                     : field.type === "status" && value
//                     ? (
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             value === "active"
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}
//                         >
//                           {value}
//                         </span>
//                       )
//                     : typeof value === "object" && value !== null
//                     ? value // Render JSX directly if value is a React element
//                     : value || "-"}
//                 </p>
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default ReusableModal;
import React, { isValidElement } from "react"; 
import { Modal } from "antd";
import dayjs from "dayjs";

const ReusableModal = ({
  isOpen,
  onClose,
  title,
  data,
  fields,
  imageConfig = {
    show: true,
    path: "image",
    alt: "title",
  },
}) => {
  if (!data) return null;

  // Helper function to get nested property safely
  const getNestedProperty = (obj, path) => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  return (
    <Modal
      title={title || "Details"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="p-4">
        {imageConfig.show && (
          <div className="flex justify-center mb-4">
            {imageConfig.render ? (
              imageConfig.render(getNestedProperty(data, imageConfig.path) || [])
            ) : (
              getNestedProperty(data, imageConfig.path) && (
                <img
                  src={getNestedProperty(data, imageConfig.path)}
                  alt={data[imageConfig.alt] || "Image"}
                  className="w-32 h-32 object-cover rounded-md"
                />
              )
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => {
            // Skip rendering if showIf condition is not met
            if (field.showIf && !field.showIf(data)) {
              return null;
            }

            const rawValue = field.render
              ? field.render(getNestedProperty(data, field.key))
              : getNestedProperty(data, field.key);

            // Apply format function if provided, otherwise use rawValue
            const value = field.format
              ? field.format(rawValue, data)
              : rawValue;

            return (
              <React.Fragment key={field.key}>
                <p className="font-semibold">{field.label}:</p>
                <p>
                  {field.type === "date" && value
                    ? dayjs(value).format("DD/MM/YYYY")
                    : field.type === "percentage" && value
                    ? `${value}%`
                    : field.type === "currency" && value
                    ? `₹${value}`
                    : field.type === "status" && value
                    ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            value === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {value}
                        </span>
                      )
                    : isValidElement(value) // Check if value is a React element
                    ? value // Render JSX directly
                    : typeof value === "object" && value !== null
                    ? JSON.stringify(value, null, 2) // Fallback for other objects
                    : value || "-"}
                </p>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ReusableModal;