import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "<!-- Ramadan Date (Calendar UI) -->"
end_marker = "<!-- Venue Selector -->"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_calendar = """
                        <!-- Ramadan Date (Calendar UI) -->
                        <div class="form-group">
                            <label>Select Date</label>
                            <input type="hidden" id="ramadan-date" required>
                            <div class="calendar-wrapper">
                                <div class="calendar-header">
                                    <span class="calendar-title">Ramadan 2026</span>
                                    <span style="font-size: 0.7rem; opacity: 0.6;">Feb — Mar 2026</span>
                                </div>
                                <div class="calendar-grid">
                                    <div class="day-label">Sun</div>
                                    <div class="day-label">Mon</div>
                                    <div class="day-label">Tue</div>
                                    <div class="day-label">Wed</div>
                                    <div class="day-label">Thu</div>
                                    <div class="day-label">Fri</div>
                                    <div class="day-label">Sat</div>

                                    <!-- Week 1: Feb 15-21 -->
                                    <div class="calendar-day" style="opacity: 0; pointer-events: none;"></div>
                                    <div class="calendar-day" style="opacity: 0; pointer-events: none;"></div>
                                    <div class="calendar-day" style="opacity: 0; pointer-events: none;"></div>
                                    <div class="calendar-day" data-val="Ramadan 1 — Wed, 18 Feb"><span class="day-number">18</span><span class="greg-date">RMD 1</span></div>
                                    <div class="calendar-day" data-val="Ramadan 2 — Thu, 19 Feb"><span class="day-number">19</span><span class="greg-date">RMD 2</span></div>
                                    <div class="calendar-day" data-val="Ramadan 3 — Fri, 20 Feb"><span class="day-number">20</span><span class="greg-date">RMD 3</span></div>
                                    <div class="calendar-day" data-val="Ramadan 4 — Sat, 21 Feb"><span class="day-number">21</span><span class="greg-date">RMD 4</span></div>

                                    <!-- Week 2: Feb 22-28 -->
                                    <div class="calendar-day" data-val="Ramadan 5 — Sun, 22 Feb"><span class="day-number">22</span><span class="greg-date">RMD 5</span></div>
                                    <div class="calendar-day booked"><span class="day-number">23</span><span class="greg-date">RMD 6</span></div>
                                    <div class="calendar-day" data-val="Ramadan 7 — Tue, 24 Feb"><span class="day-number">24</span><span class="greg-date">RMD 7</span></div>
                                    <div class="calendar-day" data-val="Ramadan 8 — Wed, 25 Feb"><span class="day-number">25</span><span class="greg-date">RMD 8</span></div>
                                    <div class="calendar-day" data-val="Ramadan 9 — Thu, 26 Feb"><span class="day-number">26</span><span class="greg-date">RMD 9</span></div>
                                    <div class="calendar-day" data-val="Ramadan 10 — Fri, 27 Feb"><span class="day-number">27</span><span class="greg-date">RMD 10</span></div>
                                    <div class="calendar-day" data-val="Ramadan 11 — Sat, 28 Feb"><span class="day-number">28</span><span class="greg-date">RMD 11</span></div>

                                    <!-- Week 3: Mar 1-7 -->
                                    <div class="calendar-day" data-val="Ramadan 12 — Sun, 1 Mar"><span class="day-number">1</span><span class="greg-date">RMD 12</span></div>
                                    <div class="calendar-day" data-val="Ramadan 13 — Mon, 2 Mar"><span class="day-number">2</span><span class="greg-date">RMD 13</span></div>
                                    <div class="calendar-day booked"><span class="day-number">3</span><span class="greg-date">RMD 14</span></div>
                                    <div class="calendar-day" data-val="Ramadan 15 — Wed, 4 Mar"><span class="day-number">4</span><span class="greg-date">RMD 15</span></div>
                                    <div class="calendar-day" data-val="Ramadan 16 — Thu, 5 Mar"><span class="day-number">5</span><span class="greg-date">RMD 16</span></div>
                                    <div class="calendar-day" data-val="Ramadan 17 — Fri, 6 Mar"><span class="day-number">6</span><span class="greg-date">RMD 17</span></div>
                                    <div class="calendar-day" data-val="Ramadan 18 — Sat, 7 Mar"><span class="day-number">7</span><span class="greg-date">RMD 18</span></div>

                                    <!-- Week 4: Mar 8-14 -->
                                    <div class="calendar-day" data-val="Ramadan 19 — Sun, 8 Mar"><span class="day-number">8</span><span class="greg-date">RMD 19</span></div>
                                    <div class="calendar-day" data-val="Ramadan 20 — Mon, 9 Mar"><span class="day-number">9</span><span class="greg-date">RMD 20</span></div>
                                    <div class="calendar-day" data-val="Ramadan 21 — Tue, 10 Mar"><span class="day-number">10</span><span class="greg-date">RMD 21</span></div>
                                    <div class="calendar-day booked"><span class="day-number">11</span><span class="greg-date">RMD 22</span></div>
                                    <div class="calendar-day" data-val="Ramadan 23 — Thu, 12 Mar"><span class="day-number">12</span><span class="greg-date">RMD 23</span></div>
                                    <div class="calendar-day" data-val="Ramadan 24 — Fri, 13 Mar"><span class="day-number">13</span><span class="greg-date">RMD 24</span></div>
                                    <div class="calendar-day" data-val="Ramadan 25 — Sat, 14 Mar"><span class="day-number">14</span><span class="greg-date">RMD 25</span></div>

                                    <!-- Week 5: Mar 15-20 -->
                                    <div class="calendar-day" data-val="Ramadan 26 — Sun, 15 Mar"><span class="day-number">15</span><span class="greg-date">RMD 26</span></div>
                                    <div class="calendar-day booked"><span class="day-number">16</span><span class="greg-date">RMD 27</span></div>
                                    <div class="calendar-day" data-val="Ramadan 28 — Tue, 17 Mar"><span class="day-number">17</span><span class="greg-date">RMD 28</span></div>
                                    <div class="calendar-day" data-val="Ramadan 29 — Wed, 18 Mar"><span class="day-number">18</span><span class="greg-date">RMD 29</span></div>
                                    <div class="calendar-day" data-val="Ramadan 30 — Thu, 19 Mar"><span class="day-number">19</span><span class="greg-date">RMD 30</span></div>
                                    <div class="calendar-day" data-val="Eid Expected — Fri, 20 Mar"><span class="day-number">20</span><span class="greg-date">EID?</span></div>
                                </div>
                            </div>
                        </div>

"""
    new_content = content[:start_idx] + new_calendar + content[end_idx:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Calendar updated successfully.")
else:
    print("Markers not found.")
