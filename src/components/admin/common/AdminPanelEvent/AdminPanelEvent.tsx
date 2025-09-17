import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
} from "@/components/ui";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

import {
  GripVertical,
  Settings,
  RefreshCw,
  Search,
  CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useCopyToClipboard } from "@/hooks";
import type { tableConfigDataType } from "@/app/(admin)/admin/dashboard/events/eventTableConfig";

const categories = [
  { value: "EVENT", label: "Events" },
  { value: "WORKSHOP", label: "Workshops" },
  { value: "EXHIBITION", label: "Exhibitions" },
  { value: "HACKATHON", label: "Hackathons" },
] as const;

type CategoryType = (typeof categories)[number]["value"];

type Props = {
  text: string;
  hideText?: boolean;
  isEmail?: boolean;
};

type StatusType = "UPCOMING" | "OPEN" | "CLOSED";
type ReviewStatusType = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  const visiblePart = localPart.slice(-4); // last 4 chars
  const hiddenPart = "*".repeat(Math.max(localPart.length - 4, 0));

  return `${hiddenPart}${visiblePart}@${domain}`;
};

const convertPasswordToDots = (password: string): string => {
  return "*".repeat(password.length);
};

const TextWithCopyIcon: React.FC<Props> = ({ text, hideText, isEmail }) => {
  const { copyToClipboard } = useCopyToClipboard();

  const displayText = hideText
    ? isEmail
      ? maskEmail(text)
      : convertPasswordToDots(text)
    : text;

  return (
    <div className="flex items-center gap-2 leading-none">
      <p className="line-clamp-1 py-1 font-medium">{displayText}</p>
      <div className="w-[10px]">
        <Button
          className="hidden h-auto bg-transparent p-0 shadow-none duration-100 hover:bg-transparent focus:outline-none group-hover:block"
          onClick={() => {
            copyToClipboard(text);
            toast.info("Copied to clipboard");
          }}
        >
          <CopyIcon className="max-w-[12px] text-black" />
        </Button>
      </div>
    </div>
  );
};

const AdminEventsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("EVENT");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [registrationFilter, setRegistrationFilter] = useState<StatusType[]>(
    [],
  );
  const [reviewFilter, setReviewFilter] = useState<ReviewStatusType[]>([]);
  const [hiddenFilter, setHiddenFilter] = useState<("HIDDEN" | "VISIBLE")[]>(
    [],
  );

  // Toggle helper
  const toggleValue = <T,>(
    value: T,
    array: T[],
    setter: (newArr: T[]) => void,
  ) => {
    if (array.includes(value)) {
      setter(array.filter((v) => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const [events, setEvents] = useState<
    Record<CategoryType, tableConfigDataType[]>
  >({
    EVENT: [],
    WORKSHOP: [],
    EXHIBITION: [],
    HACKATHON: [],
  });

  // tRPC queries and mutations
  const {
    data: allEventsData,
    isLoading: isLoadingAll,
    refetch: refetchAll,
    isRefetching: isRefetchingAll,
  } = api.event.getAllEventsGroupedByCategory.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingCategory, refetch: refetchCategory } =
    api.event.getEventsByCategory.useQuery(
      { category: activeCategory },
      { enabled: false },
    );

  const reorderMutation = api.event.reorderEvents.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Events reordered successfully");
      } else {
        toast.error(data.message || "Failed to reorder events");
        void refetchCategory();
      }
    },
    onError: (error) => {
      toast.error("Failed to reorder events");
      console.error("Reorder error:", error);
      void refetchCategory();
    },
  });

  // Load initial data
  useEffect(() => {
    if (allEventsData) {
      const formattedEvents: Record<CategoryType, tableConfigDataType[]> = {
        EVENT: allEventsData.EVENT?.formattedData ?? [],
        WORKSHOP: allEventsData.WORKSHOP?.formattedData ?? [],
        EXHIBITION: allEventsData.EXHIBITION?.formattedData ?? [],
        HACKATHON: allEventsData.HACKATHON?.formattedData ?? [],
      };
      setEvents(formattedEvents);
    }
  }, [allEventsData]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const { source, destination } = result;
    const categoryEvents = [...events[activeCategory]];

    const [reorderedItem] = categoryEvents.splice(source.index, 1);
    if (!reorderedItem) return;

    categoryEvents.splice(destination.index, 0, reorderedItem);

    setEvents((prev) => ({
      ...prev,
      [activeCategory]: categoryEvents,
    }));

    const eventIds = categoryEvents.map((event) => event.id);
    try {
      await reorderMutation.mutateAsync({
        eventIds,
        category: activeCategory,
      });
    } catch (error) {
      console.error("Failed to reorder:", error);
    }
  };

  const handleRefreshAll = async (): Promise<void> => {
    try {
      await refetchAll();
    } catch (error) {
      console.error("Failed to refresh:", error);
    }
  };

  const getStatusPill = (
    status: string | boolean,
    type: "registration" | "review" | "hidden" = "registration",
  ): React.ReactElement => {
    if (type === "registration") {
      const registrationStatus = status as StatusType;
      const styles: Record<StatusType, string> = {
        UPCOMING: "bg-gray-100 text-gray-700",
        OPEN: "bg-green-100 text-green-700",
        CLOSED: "bg-red-100 text-red-700",
      };
      const dots: Record<StatusType, string> = {
        UPCOMING: "bg-gray-500",
        OPEN: "bg-green-500",
        CLOSED: "bg-red-500",
      };
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[registrationStatus]}`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${dots[registrationStatus]}`}
          ></div>
          Registration{" "}
          {registrationStatus === "UPCOMING"
            ? "Upcoming"
            : registrationStatus === "OPEN"
              ? "Open"
              : "Closed"}
        </span>
      );
    }

    if (type === "review") {
      const reviewStatus = status as ReviewStatusType;
      const styles: Record<ReviewStatusType, string> = {
        NONE: "bg-gray-100 text-gray-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
      };
      const dots: Record<ReviewStatusType, string> = {
        NONE: "bg-gray-500",
        PENDING: "bg-yellow-500",
        APPROVED: "bg-green-500",
        REJECTED: "bg-red-500",
      };
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[reviewStatus]}`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${dots[reviewStatus]}`}
          ></div>
          Review{" "}
          {reviewStatus.charAt(0).toUpperCase() +
            reviewStatus.slice(1).toLowerCase()}
        </span>
      );
    }

    if (type === "hidden") {
      const isHidden = status as boolean;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isHidden ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${isHidden ? "bg-red-500" : "bg-gray-500"}`}
          ></div>
          Event {isHidden ? "Hidden" : "Not Hidden"}
        </span>
      );
    }

    // Fallback return
    return <span></span>;
  };

  // Filter events based on search term
  const filteredEvents =
    events[activeCategory]?.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.coordinatorEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        event.eventId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegistration =
        registrationFilter.length === 0 ||
        registrationFilter.includes(event.registrationStatus);

      const matchesReview =
        reviewFilter.length === 0 ||
        reviewFilter.includes(event.reviewRequestStatus);

      const matchesHidden =
        hiddenFilter.length === 0 ||
        (hiddenFilter.includes("HIDDEN") && event.isHidden) ||
        (hiddenFilter.includes("VISIBLE") && !event.isHidden);

      return (
        matchesSearch && matchesRegistration && matchesReview && matchesHidden
      );
    }) || [];

  const isLoading =
    isLoadingAll || isLoadingCategory || reorderMutation.isPending;

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold">Event Management</h1> */}
        <p className="text-xl font-semibold">All Events</p>
        <Button
          onClick={() => void handleRefreshAll()}
          disabled={isLoading || isRefetchingAll}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading || isRefetchingAll ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as CategoryType)}
      >
        <TabsList className="mb-6 grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="flex items-center gap-2"
            >
              {category.label} ({events[category.value]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-9 text-sm"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {registrationFilter.length === 0
                    ? "Registration Status"
                    : `Registration: (${registrationFilter.join(") (")})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandGroup>
                    {["UPCOMING", "OPEN", "CLOSED"].map((status) => (
                      <CommandItem
                        key={status}
                        onSelect={() =>
                          toggleValue(
                            status as StatusType,
                            registrationFilter,
                            setRegistrationFilter,
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={registrationFilter.includes(
                            status as StatusType,
                          )}
                        />
                        {status}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {reviewFilter.length === 0
                    ? "Review Status"
                    : `Review: (${reviewFilter.join(") (")})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandGroup>
                    {["NONE", "PENDING", "APPROVED", "REJECTED"].map(
                      (status) => (
                        <CommandItem
                          key={status}
                          onSelect={() =>
                            toggleValue(
                              status as ReviewStatusType,
                              reviewFilter,
                              setReviewFilter,
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={reviewFilter.includes(
                              status as ReviewStatusType,
                            )}
                          />
                          {status}
                        </CommandItem>
                      ),
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {hiddenFilter.length === 0
                    ? "Visibility"
                    : `Visibility: (${hiddenFilter.join(") (")})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandGroup>
                    {["VISIBLE", "HIDDEN"].map((status) => (
                      <CommandItem
                        key={status}
                        onSelect={() =>
                          toggleValue(
                            status as "HIDDEN" | "VISIBLE",
                            hiddenFilter,
                            setHiddenFilter,
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={hiddenFilter.includes(
                            status as "HIDDEN" | "VISIBLE",
                          )}
                        />
                        {status}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={() => {
              setRegistrationFilter([]);
              setReviewFilter([]);
              setHiddenFilter([]);
              setSearchTerm("");
            }}
          >
            Clear All Filters
          </Button>
        </div>
        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <div className="bg-white">
              {isLoading && !events[category.value]?.length ? (
                <div className="mt-5">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-5 border-b py-2"
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="loader h-4 w-full rounded-full bg-gray-300" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="grid-cols-13 grid gap-4 border-b bg-gray-50 py-3 text-sm font-medium text-gray-700">
                    <div className="col-span-1"></div> {/* Drag handle space */}
                    <div className="col-span-2">Title</div>
                    <div className="col-span-2">Coordinator Email</div>
                    <div className="col-span-2">Event ID</div>
                    <div className="col-span-2">Password</div>
                    <div className="col-span-1">Dashboard</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Action</div> {/* Actions */}
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={category.value}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={
                            snapshot.isDraggingOver ? "bg-blue-50" : ""
                          }
                        >
                          {filteredEvents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              {searchTerm
                                ? "No events match your search"
                                : "No events found in this category"}
                            </div>
                          ) : (
                            filteredEvents.map((event, index) => (
                              <Draggable
                                key={event.id}
                                draggableId={event.id}
                                index={index}
                                isDragDisabled={
                                  reorderMutation.isPending || isRefetchingAll
                                }
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`group border-b last:border-b-0 ${
                                      snapshot.isDragging
                                        ? "rounded border border-blue-200 bg-white shadow-lg"
                                        : "bg-white hover:bg-gray-50"
                                    } ${reorderMutation.isPending || isRefetchingAll ? "opacity-60" : ""}`}
                                  >
                                    <div className="grid-cols-13 grid items-center gap-4 py-4 text-sm">
                                      {/* Drag Handle */}
                                      <div className="col-span-1">
                                        <div
                                          {...provided.dragHandleProps}
                                          className={`text-gray-400 hover:text-gray-600 ${
                                            reorderMutation.isPending ||
                                            isRefetchingAll
                                              ? "cursor-not-allowed"
                                              : "cursor-grab active:cursor-grabbing"
                                          }`}
                                        >
                                          <GripVertical size={16} />
                                        </div>
                                      </div>

                                      {/* Title */}
                                      <div className="col-span-2">
                                        <div className="truncate font-medium text-gray-900">
                                          {event.title}
                                        </div>
                                      </div>

                                      {/* Coordinator Email */}
                                      <div className="col-span-2">
                                        <div className="truncate">
                                          <TextWithCopyIcon
                                            text={event.coordinatorEmail}
                                          />
                                        </div>
                                      </div>

                                      {/* Event ID */}
                                      <div className="col-span-2">
                                        <div className="truncate font-mono text-xs">
                                          <TextWithCopyIcon
                                            text={event.eventId}
                                          />
                                        </div>
                                      </div>

                                      {/* Dashboard Password */}
                                      <div className="col-span-2">
                                        <div className="font-mono text-xs">
                                          <TextWithCopyIcon
                                            text={event.eventDbPassword}
                                            hideText
                                          />
                                        </div>
                                      </div>

                                      {/* Dashboard URL */}
                                      <div className="col-span-1">
                                        <div className="-mt-2">
                                          <Link
                                            href={event.eventDbURL}
                                            className="text-xs text-blue-600 underline hover:text-blue-800"
                                            target="_blank"
                                          >
                                            URL
                                          </Link>
                                        </div>
                                      </div>

                                      {/* Status Pills */}
                                      <div className="col-span-2 flex flex-col gap-1">
                                        {getStatusPill(
                                          event.registrationStatus,
                                          "registration",
                                        )}
                                        {getStatusPill(
                                          event.isHidden,
                                          "hidden",
                                        )}
                                        {getStatusPill(
                                          event.reviewRequestStatus,
                                          "review",
                                        )}
                                      </div>

                                      {/* Actions */}
                                      <div className="col-span-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          asChild
                                        >
                                          <Link
                                            href={`/admin/dashboard/events/${event.eventId}`}
                                          >
                                            <Settings size={12} />
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminEventsPanel;
