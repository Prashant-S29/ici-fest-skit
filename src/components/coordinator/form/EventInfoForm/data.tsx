import type { CreateEventInfoFormConfig } from "@/types";

export const CreateEventInfoFormData: CreateEventInfoFormConfig[] = [
  {
    category: "About",
    categoryId: "about",

    fields: [
      {
        fieldTitle: "Short Description",
        fieldDescription:
          "2 liner description for your event. This will be used in the event card.",
        fieldName: "shortDescription",
        fieldPlaceholder: "Short Description",
        fieldType: {
          type: "textarea",
        },
        fieldDataType: "text",
        className: "h-[150px]",
      },
      {
        fieldTitle: "Description",
        fieldDescription:
          "Brief description for your event. This will be used in the event page. Provide all the necessary details about event, stages, rules and more",
        fieldName: "description",
        fieldPlaceholder: "Description",
        fieldType: {
          type: "textarea",
        },
        fieldDataType: "text",
        className: "h-[250px]",
      },
      {
        fieldTitle: "WhatsApp Group Link",
        fieldDescription:
          "This will be used to send notifications to your group.",
        fieldName: "whatsappGroupURL",
        fieldPlaceholder: "WhatsApp Group Link",
        fieldType: {
          type: "input",
        },
        fieldDataType: "url",
      },
      {
        fieldTitle: "Event Brochure",
        fieldDescription:
          "Provide a Google Drive link to the brochure of your event. Include all the details about the event, stages, rules and more.",
        fieldName: "brochure",
        fieldPlaceholder: "Event Brochure",
        fieldType: {
          type: "input",
        },
        fieldDataType: "url",
      },
    ],
  },

  {
    category: "Assets",
    categoryId: "assets",
    fields: [
      {
        fieldTitle: "Cover Image",
        fieldDescription: (
          <span>
            This image will be displayed on the event page along with the cover
            photo.
            <br />
            <br />
            <span className="font-semibold">
              Maximum size of a image is 4 MB.
            </span>
            <br />
            <span className="italic">(.png, .jpg, .webp)</span>
          </span>
        ),

        fieldName: "coverImage",
        fieldPlaceholder: "Cover Image URL",
        fieldType: {
          type: "upload",
          uploadOptions: {
            accept: ".png, .jpg, .jpeg",
            maxSizePerFileInMegabyte: 5,
            maxFiles: 1,
            minFiles: 1,
          },
        },
        fieldDataType: "text",
      },
      {
        fieldTitle: "Upload Photos",
        fieldDescription: (
          <span>
            This photo will be displayed on the event page along with the cover
            photo.
            <br />
            <br />
            <span className="font-semibold">Upload Maximum 5 photos.</span>
            <br />
            <span className="font-semibold">
              Maximum size of each photo is 4 MB.
            </span>
            <br />
            <span className="italic">(.png, .jpg, .webp)</span>
          </span>
        ),
        fieldName: "images",
        fieldPlaceholder: "Upload",
        fieldType: {
          type: "upload",
          uploadOptions: {
            accept: ".png, .jpg, .jpeg",
            maxSizePerFileInMegabyte: 5,
            minFiles: 1,
            maxFiles: 5,
          },
        },
        fieldDataType: "image",
      },
    ],
  },
  {
    category: "Rules",
    categoryId: "rules",
    isOptional: true,

    fields: [
      {
        fieldTitle: "Judgement Criteria",
        fieldDescription: (
          <span>
            Mention the Judgement Criteria for your event.{" "}
            <span className="font-medium">
              If having multiple, provide (-) after each point.
            </span>
          </span>
        ),
        fieldName: "judgementCriteria",
        fieldPlaceholder: "Judgement Criteria",
        fieldType: {
          type: "textarea",
        },
        fieldDataType: "text",
        className: "h-[150px]",
      },
      {
        fieldTitle: "Disqualification Criteria",
        fieldDescription: (
          <span>
            Mention the Disqualification Criteria for your event.{" "}
            <span className="font-medium">
              If having multiple, provide (-) after each point.
            </span>
          </span>
        ),
        fieldName: "disqualificationCriteria",
        fieldPlaceholder: "Disqualification Criteria",
        fieldType: {
          type: "textarea",
        },
        fieldDataType: "text",
        className: "h-[150px]",
      },
    ],
  },

  {
    category: "Resources",
    categoryId: "materials",
    isOptional: true,

    fields: [
      {
        fieldTitle: "Materials Provided",
        fieldDescription: (
          <span>
            Materials provided by you to the participants during the event.{" "}
            <span className="font-medium">
              If having multiple, provide (-) after each point.
            </span>
          </span>
        ),
        fieldName: "materialsProvided",
        fieldPlaceholder: "Materials Provided",
        fieldType: {
          type: "textarea",
        },
        fieldDataType: "text",
        className: "h-[150px]",
      },
    ],
  },
];
