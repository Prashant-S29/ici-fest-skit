import type { FormConfigProps } from "@/types";

export const CreateEventFormData: FormConfigProps[] = [
  {
    category: "Event Dashboard Configurations",
    categoryId: "eventDashboard",
    fields: [
      {
        fieldTitle: "Event Title",
        fieldDescription: "Name of your event",
        fieldName: "title",
        fieldPlaceholder: "Title",
        fieldType: {
          type: "input",
        },
        fieldDataType: "text",
      },
      {
        fieldTitle: "Event Id",
        fieldDescription: "Id to access your event dashboard",
        fieldName: "slug",
        fieldPlaceholder: "Event Id",
        fieldType: {
          type: "input",
        },
        fieldDataType: "text",
      },
      {
        fieldTitle: "Event Dashboard Password",
        fieldDescription: "Password to access your event dashboard",
        fieldName: "dbPassword",
        fieldPlaceholder: "Password",
        fieldType: {
          type: "input",
        },
        fieldDataType: "password",
      },
    ],
  },
  // {
  //   category: "Basic Information",
  //   categoryId: "basicInformation",
  //   isOptional: true,

  //   fields: [
  //     {
  //       fieldTitle: "Short Description",
  //       fieldDescription:
  //         "2 liner description for your event. This will be used in the event card.",
  //       fieldName: "shortDescription",
  //       fieldPlaceholder: "Short Description",
  //       fieldType: {
  //         type: "textarea",
  //       },
  //       fieldDataType: "text",
  //       className: "h-[150px]",
  //     },
  //     {
  //       fieldTitle: "Description",
  //       fieldDescription:
  //         "Brief description for your event. This will be used in the event page. Provide all the necessary details about event, stages, rules and more",
  //       fieldName: "description",
  //       fieldPlaceholder: "Description",
  //       fieldType: {
  //         type: "textarea",
  //       },
  //       fieldDataType: "text",
  //       className: "h-[250px]",
  //     },
  //     {
  //       fieldTitle: "Category",
  //       fieldDescription:
  //         "This will be used as the cover image for your event page. For best results, use a 600px x 500px image",
  //       fieldName: "category",
  //       fieldType: {
  //         type: "select",
  //         options: [
  //           {
  //             label: "Event",
  //             value: "EVENT",
  //           },
  //           {
  //             label: "Workshop",
  //             value: "WORKSHOP",
  //           },
  //           {
  //             label: "Exhibition",
  //             value: "EXHIBITION",
  //           },
  //         ],
  //       },
  //       fieldDataType: "password",
  //     },
  //   ],
  // },
  {
    category: "Registration",
    categoryId: "registration",
    fields: [
      {
        fieldTitle: "Registration Status",
        fieldDescription: "Registration status for your event",
        fieldName: "registrationStatus",
        fieldType: {
          type: "select",
          options: [
            {
              label: "Upcoming",
              value: "UPCOMING",
            },
            {
              label: "Open",
              value: "OPEN",
            },
            {
              label: "Closed",
              value: "CLOSED",
            },
          ],
        },
        fieldDataType: "text",
      },
      {
        fieldTitle: "Registration Type",
        fieldDescription:
          "How will your event be registered? Is it a Team event or an Individual event? or Both?",
        fieldName: "registrationType",
        fieldType: {
          type: "select",
          options: [
            {
              label: "Team",
              value: "TEAM",
            },
            {
              label: "Individual",
              value: "INDIVIDUAL",
            },
            {
              label: "Both",
              value: "BOTH",
            },
          ],
        },
        fieldDataType: "text",
      },
    ],
  },
  {
    category: "Schedule",
    categoryId: "schedule",
    fields: [
      {
        fieldTitle: "Event Duration In Days",
        fieldDescription: "How long will your event last?",
        fieldName: "durationInDays",
        fieldPlaceholder: "Event Duration In days",
        fieldType: {
          type: "input",
        },
        fieldDataType: "number",
      },
    ],
  },

  // {
  //   category: "Assets",
  //   categoryId: "assets",
  //   fields: [
  //     {
  //       fieldTitle: "Cover Image",
  //       fieldDescription:
  //         "This will be used as the cover image for your event page. For best results, use a 600px x 500px image",
  //       fieldName: "coverImage",
  //       fieldPlaceholder: "Cover Image URL",
  //       fieldType: {
  //         type: "upload",
  //         uploadOptions: {
  //           accept: ".png, .jpg, .jpeg",
  //           maxSizePerFileInMegabyte: 5,
  //           maxFiles: 1,
  //           minFiles: 1,
  //         },
  //       },
  //       fieldDataType: "text",
  //     },
  //     {
  //       fieldTitle: "Upload Photos",
  //       fieldDescription: (
  //         <span>
  //           This photo will be displayed on the event page along with the cover
  //           photo.
  //           <br />
  //           <br />
  //           <span className="font-semibold">
  //             Upload Minimum 2 and Maximum 5 photos.
  //           </span>
  //           <br />
  //           <span className="font-semibold">
  //             Maximum size of each photo is 4 MB.
  //           </span>
  //           <br />
  //           <span className="italic">(.png, .jpg, .webp)</span>
  //         </span>
  //       ),
  //       fieldName: "images",
  //       fieldPlaceholder: "Upload",
  //       fieldType: {
  //         type: "upload",
  //         uploadOptions: {
  //           accept: ".png, .jpg, .jpeg",
  //           maxSizePerFileInMegabyte: 5,
  //           minFiles: 1,
  //           maxFiles: 5,
  //         },
  //       },
  //       fieldDataType: "image",
  //     },
  //   ],
  // },

  {
    category: "Coordinators",
    categoryId: "coordinators",
    fields: [],
  },

  {
    category: "Controllers Configurations",
    categoryId: "controllers",
    fields: [
      {
        fieldTitle: "Hide Event",
        fieldDescription: "Hide your event from the event list",
        fieldName: "isHidden",
        fieldType: {
          type: "toggle",
        },
        fieldDataType: "text",
      },
    ],
  },
];
