export const branchYearHandler = ({
  branch,
  year,
}: {
  branch: string;
  year: number;
}) => {
  let yrString;

  switch (year) {
    case 1:
      yrString = "1st Year";
      break;
    case 2:
      yrString = "2nd Year";
      break;
    case 3:
      yrString = "3rd Year";
      break;
    case 4:
      yrString = "4th Year";
      break;
    default:
      yrString = "1st Year";

      break;
  }

  return `${branch.replaceAll("_", "-")} - ${yrString}`;
};
