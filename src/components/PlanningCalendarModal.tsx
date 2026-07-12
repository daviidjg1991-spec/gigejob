import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User as UserIcon,
  Maximize2
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  eachDayOfInterval,
  isToday,
  startOfDay
} from "date-fns";
import { es } from "date-fns/locale";
import { Booking, UserProfile } from "../types";
import { cn } from "../lib/utils";

interface PlanningCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

type ViewMode = "day" | "week" | "month";

const parseSpanishDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const parts = dateStr.toLowerCase().split(" ");
  if (parts.length >= 3) {
    const day = parseInt(parts[0]);
    const monthStr = parts[2];
    const month = months.indexOf(monthStr);
    const year = parts[4] ? parseInt(parts[4]) : new Date().getFullYear();
    
    if (!isNaN(day) && month !== -1) {
      return new Date(year, month, day);
    }
  }
  
  const isoParsed = parseISO(dateStr);
  if (!isNaN(isoParsed.getTime())) return isoParsed;

  return null;
};

export const PlanningCalendarModal: React.FC<PlanningCalendarModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  // For day/week view: baseDate controls the current view
  // For week view: 1 day past, today, 5 days future.
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const qAuth = query(
          collection(db, "bookings"),
          where("professionalId", "==", user.id)
        );
        const qClient = query(
          collection(db, "bookings"),
          where("clientId", "==", user.id)
        );

        const [authSnap, clientSnap] = await Promise.all([
          getDocs(qAuth),
          getDocs(qClient),
        ]);

        const fetchedBookings: Booking[] = [];
        authSnap.forEach((doc) => {
          const data = doc.data() as Booking;
          if (data.status === "accepted") {
            fetchedBookings.push({ ...data, id: doc.id });
          }
        });
        clientSnap.forEach((doc) => {
          const data = doc.data() as Booking;
          if (data.status === "accepted" && !fetchedBookings.some((b) => b.id === doc.id)) {
            fetchedBookings.push({ ...data, id: doc.id });
          }
        });

        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings for calendar", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen, user?.id]);

  useEffect(() => {
    // Scroll container to top when view changes
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, viewMode, baseDate]);

  const handlePrev = () => {
    if (viewMode === "day") setBaseDate(subDays(baseDate, 1));
    else if (viewMode === "week") setBaseDate(subDays(baseDate, 7));
    else setBaseDate(subMonths(baseDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "day") setBaseDate(addDays(baseDate, 1));
    else if (viewMode === "week") setBaseDate(addDays(baseDate, 7));
    else setBaseDate(addMonths(baseDate, 1));
  };

  if (!isOpen) return null;

  const renderDailySchedule = (dateStr: string, dateObj: Date) => {
    const dayBookings = bookings.filter((b) => {
      if (!b.date) return false;
      const parsedDate = parseSpanishDate(b.date);
      if (!parsedDate) return false;
      return isSameDay(parsedDate, dateObj);
    });

    return (
      <div key={dateStr} className="relative border-r border-gray-200 flex-1 min-w-[120px]">
        {/* Background hours grid */}
        {Array.from({ length: 17 }).map((_, i) => (
          <div
            key={i}
            className="h-16 shrink-0 border-b border-gray-200 border-solid relative pointer-events-none"
          >
            <div className="absolute top-1/2 left-0 w-full border-b border-gray-100 border-dashed" />
          </div>
        ))}

        {/* Bookings */}
        {dayBookings.map((b) => {
          let bHour = 0;
          let bMin = 0;
          if (b.time) {
            const parts = b.time.split(":");
            bHour = parseInt(parts[0], 10) || 0;
            bMin = parseInt(parts[1], 10) || 0;
          }
          const dStr = b.duration ? b.duration.replace(/\D/g, "") : "1";
          const duration = parseInt(dStr || "1", 10) || 1;

          // Only render if it starts after or at 7:00
          if (bHour < 7) return null;

          const top = ((bHour - 7) + bMin / 60) * 64;
          const height = duration * 64;
          const isProfessional = b.professionalId === user?.id;

          return (
            <div
              key={b.id}
              className={cn(
                "absolute left-1 right-1 rounded-lg p-2 overflow-hidden shadow-sm border transition-all hover:z-10 hover:shadow-md cursor-pointer",
                isProfessional
                  ? "bg-primary/20 border-primary/40 text-primary-dark"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-900"
              )}
              style={{ top: `${top}px`, height: `${height - 2}px` }}
              title={`${b.listingTitle} (${b.time})`}
            >
              <div className="font-bold text-[10px] sm:text-xs truncate leading-tight mb-1">
                {b.listingTitle}
              </div>
              <div className="text-[9px] font-medium opacity-80 truncate flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {b.time}
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">
                {isProfessional ? "Como Profesional" : "Como Cliente"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderView = () => {
    if (viewMode === "month") {
      const start = startOfWeek(startOfMonth(baseDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(baseDate), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end });

      return (
        <div className="flex flex-col h-full bg-surface-container-lowest">
          <div className="grid grid-cols-7 border-b border-gray-200 text-center sticky top-0 bg-surface-container-lowest z-10 py-3 shadow-sm">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {days.map((day) => {
              const dayBookings = bookings.filter((b) => {
                if (!b.date) return false;
                const parsedDate = parseSpanishDate(b.date);
                if (!parsedDate) return false;
                return isSameDay(parsedDate, day);
              });

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[100px] border-b border-r border-gray-200 p-2 flex flex-col gap-1 overflow-hidden transition-colors hover:bg-surface-container-low cursor-pointer",
                    !isSameMonth(day, baseDate) && "opacity-40 bg-surface-container-lowest/50",
                    isToday(day) && "bg-primary/5"
                  )}
                  onClick={() => {
                    setBaseDate(day);
                    setViewMode("day");
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={cn(
                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                        isToday(day) ? "bg-primary text-white" : "text-on-surface"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[9px] font-black tracking-widest bg-surface-container px-1.5 py-0.5 rounded-full text-on-surface-variant">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                    {dayBookings.map((b) => {
                      const isProfessional = b.professionalId === user?.id;
                      return (
                        <div
                          key={b.id}
                          className={cn(
                            "text-[9px] px-1.5 py-1 rounded truncate font-medium",
                            isProfessional
                              ? "bg-primary/10 text-primary border border-primary/10"
                              : "bg-amber-500/10 text-amber-700 border border-amber-500/10"
                          )}
                          title={`${b.listingTitle} - ${b.time}`}
                        >
                          {b.time} {b.listingTitle}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Day or Week view based on user specified 7-day range (1 day past to 5 days future)
    let visibleDays: Date[] = [];
    if (viewMode === "day") {
      visibleDays = [baseDate];
    } else {
      // 1 day past, current, 5 days future = 7 days
      visibleDays = Array.from({ length: 7 }).map((_, i) =>
        i === 0 ? subDays(baseDate, 1) : addDays(baseDate, i - 1)
      );
    }

    return (
      <div className="flex flex-col h-full bg-surface-container-lowest">
        {/* Header Days */}
        <div className="flex border-b border-gray-200 sticky top-0 bg-surface-container-lowest z-20 shadow-sm pl-16">
          {visibleDays.map((date) => (
            <div
              key={date.toISOString()}
              className={cn(
                "flex-1 text-center py-4 border-r border-gray-200 min-w-[120px]",
                isToday(date) && "bg-primary/5"
              )}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1">
                {format(date, "EEEE", { locale: es })}
              </div>
              <div
                className={cn(
                  "text-lg mx-auto font-display font-medium w-8 h-8 flex items-center justify-center rounded-full",
                  isToday(date) ? "bg-primary text-white font-bold" : "text-on-surface"
                )}
              >
                {format(date, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-auto flex bg-white relative overscroll-none"
        >
          {/* Time scale */}
          <div className="w-16 sticky left-0 shrink-0 bg-surface-container-lowest border-r border-gray-200 z-10 flex flex-col pt-0">
            {Array.from({ length: 17 }).map((_, i) => {
              const hour = i + 7;
              return (
              <div
                key={hour}
                className="h-16 shrink-0 flex justify-end pr-2 font-mono text-[10px] text-on-surface-variant/40 -mt-2"
              >
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
            )})}
          </div>

          {/* Days Columns */}
          <div className="flex flex-1 relative min-w-max">
            {visibleDays.map((date) => renderDailySchedule(date.toISOString(), date))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="bg-surface-container-lowest w-full h-full max-w-7xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/20"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:px-6 md:py-5 border-b border-outline-variant/10 bg-white z-20 shrink-0 gap-4">
              <div className="flex items-center gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {/* View Tabs */}
                <div className="flex bg-surface-container-low rounded-xl p-1 shrink-0">
                  {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        viewMode === mode
                          ? "bg-white text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      )}
                    >
                      {mode === "day"
                        ? "Día"
                        : mode === "week"
                        ? "Semana"
                        : "Mes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation & Current Month/Year */}
              <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-sm md:text-base font-bold capitalize w-32 text-center text-on-surface">
                    {format(baseDate, "MMMM yyyy", { locale: es })}
                  </h2>
                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-surface-container-low rounded-xl transition-colors text-on-surface"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-6 w-px bg-outline-variant/20 hidden sm:block"></div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors bg-surface-container-low text-on-surface-variant shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/5 flex gap-6 shrink-0 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-primary/40 border border-primary"></div>
                Tus Servicios (Profesional)
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500"></div>
                Planificados (Cliente)
              </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 relative overflow-hidden bg-surface-container-lowest">
              {isLoading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                </div>
              )}
              {renderView()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
