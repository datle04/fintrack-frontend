import React from "react";

const placeholder = () => {
  return (
    <div className="flex-1 lg:max-w-xs relative" ref={datePickerRef}>
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base text-left bg-white"
      >
        {getDateRange()}
      </button>
      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              {selectingStartDate ? "Chọn ngày bắt đầu" : "Chọn ngày kết thúc"}
            </p>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-semibold">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="text-xs text-gray-500">
              Đã chọn: {getDateRange()}
            </div>
            <button
              onClick={() => {
                setShowDatePicker(false);
                setSelectingStartDate(true);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default placeholder;
