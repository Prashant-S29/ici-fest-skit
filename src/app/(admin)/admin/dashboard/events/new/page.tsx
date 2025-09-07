import React from "react";

// Forms
import { CreateEventForm } from "@/components/admin/forms";

const NewEvent: React.FC = () => {
  return (
    <div className="bg-[#f7f7f7] px-[250px] py-[100px]">
      <section className="mt-5">
        <CreateEventForm state="CREATE" />
      </section>
    </div>
  );
};

export default NewEvent;
