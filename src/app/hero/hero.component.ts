import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  activeTab: 'flights' | 'hotels' = 'flights';
  flightType: 'one-way' | 'round-trip' | 'multi-city' = 'one-way';
  
  // Search State
  fromCity: string = 'Delhi';
  toCity: string = 'Mumbai';
  departureDate: string = '2026-05-06';
  returnDate: string = '2026-05-07';

  // Multi-City State
  multiCityRoutes = [
    { fromCity: 'Delhi', toCity: 'Mumbai', departureDate: '2026-05-05' },
    { fromCity: 'Mumbai', toCity: '', departureDate: '' }
  ];

  // Hotels State
  hotelDestination: string = '';
  checkInDate: string = '2026-05-06';
  checkOutDate: string = '2026-05-07';
  nationality: string = 'Indian (India)';
  
  isHotelGuestsModalOpen: boolean = false;
  hotelGuests = {
    adults: 2,
    children: 0,
    rooms: 1
  };

  // Custom Calendar State
  activeCalendar: 'depart' | 'return' | number | 'checkin' | 'checkout' | null = null;
  currentDate: Date = new Date(this.departureDate);

  get currentMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.currentDate.getMonth()];
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  get emptyDays(): number[] {
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    const emptyCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    return Array(emptyCount).fill(0);
  }

  get monthDays(): number[] {
    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    return Array.from({length: daysInMonth}, (_, i) => i + 1);
  }

  toggleCalendar(type: 'depart' | 'return' | number | 'checkin' | 'checkout', event: Event) {
    event.stopPropagation();
    if (this.activeCalendar === type) {
      this.activeCalendar = null;
    } else {
      this.activeCalendar = type;
      if (type === 'depart') {
        this.currentDate = new Date(this.departureDate);
      } else if (type === 'return') {
        this.currentDate = new Date(this.returnDate || new Date());
      } else if (type === 'checkin') {
        this.currentDate = new Date(this.checkInDate);
      } else if (type === 'checkout') {
        this.currentDate = new Date(this.checkOutDate);
      } else {
        const routeDate = this.multiCityRoutes[type].departureDate;
        this.currentDate = new Date(routeDate || new Date());
      }
    }
    this.isTravellerModalOpen = false;
    this.isHotelGuestsModalOpen = false;
  }

  prevMonth(event: Event) {
    event.stopPropagation();
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  selectDate(day: number, event: Event) {
    event.stopPropagation();
    const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    const dateStr = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}-${newDate.getDate().toString().padStart(2, '0')}`;
    
    if (this.activeCalendar === 'depart') {
      this.departureDate = dateStr;
      if (new Date(this.returnDate) < new Date(this.departureDate)) {
        this.returnDate = this.departureDate;
      }
    } else if (this.activeCalendar === 'return') {
      this.returnDate = dateStr;
      if (new Date(this.departureDate) > new Date(this.returnDate)) {
        this.departureDate = this.returnDate;
      }
    } else if (this.activeCalendar === 'checkin') {
      this.checkInDate = dateStr;
      if (new Date(this.checkOutDate) <= new Date(this.checkInDate)) {
        const nextDay = new Date(this.checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        this.checkOutDate = `${nextDay.getFullYear()}-${(nextDay.getMonth() + 1).toString().padStart(2, '0')}-${nextDay.getDate().toString().padStart(2, '0')}`;
      }
    } else if (this.activeCalendar === 'checkout') {
      this.checkOutDate = dateStr;
      if (new Date(this.checkInDate) >= new Date(this.checkOutDate)) {
        const prevDay = new Date(this.checkOutDate);
        prevDay.setDate(prevDay.getDate() - 1);
        this.checkInDate = `${prevDay.getFullYear()}-${(prevDay.getMonth() + 1).toString().padStart(2, '0')}-${prevDay.getDate().toString().padStart(2, '0')}`;
      }
    } else if (typeof this.activeCalendar === 'number') {
      this.multiCityRoutes[this.activeCalendar].departureDate = dateStr;
    }
    this.activeCalendar = null;
  }

  isSelectedDate(day: number): boolean {
    let selectedStr = '';
    if (this.activeCalendar === 'depart') selectedStr = this.departureDate;
    else if (this.activeCalendar === 'return') selectedStr = this.returnDate;
    else if (this.activeCalendar === 'checkin') selectedStr = this.checkInDate;
    else if (this.activeCalendar === 'checkout') selectedStr = this.checkOutDate;
    else if (typeof this.activeCalendar === 'number') selectedStr = this.multiCityRoutes[this.activeCalendar].departureDate;
    
    if (!selectedStr) return false;
    const selected = new Date(selectedStr);
    return selected.getDate() === day && 
           selected.getMonth() === this.currentDate.getMonth() && 
           selected.getFullYear() === this.currentDate.getFullYear();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.activeCalendar = null;
    this.isTravellerModalOpen = false;
    this.isHotelGuestsModalOpen = false;
  }
  
  // Modal State
  isTravellerModalOpen: boolean = false;
  travellers = {
    adults: 1,
    children: 0,
    infants: 0
  };
  flightClass: string = 'Economy';

  // State methods
  setTab(tab: 'flights' | 'hotels') {
    this.activeTab = tab;
  }

  setFlightType(type: 'one-way' | 'round-trip' | 'multi-city') {
    this.flightType = type;
  }

  swapCities(event: Event) {
    event.preventDefault();
    const temp = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = temp;
  }

  swapMultiCity(index: number, event: Event) {
    event.preventDefault();
    const temp = this.multiCityRoutes[index].fromCity;
    this.multiCityRoutes[index].fromCity = this.multiCityRoutes[index].toCity;
    this.multiCityRoutes[index].toCity = temp;
  }

  addRoute() {
    if (this.multiCityRoutes.length < 5) {
      const lastRoute = this.multiCityRoutes[this.multiCityRoutes.length - 1];
      this.multiCityRoutes.push({ fromCity: lastRoute.toCity, toCity: '', departureDate: '' });
    }
  }

  removeRoute(index: number) {
    if (this.multiCityRoutes.length > 2) {
      this.multiCityRoutes.splice(index, 1);
    }
  }


  getDay(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  getMonthYear(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} '${date.getFullYear().toString().substring(2)}`;
  }

  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  }

  getDepartureDay(): string {
    return this.getDay(this.departureDate);
  }

  getDepartureMonthYear(): string {
    return this.getMonthYear(this.departureDate);
  }

  getDepartureDayName(): string {
    return this.getDayName(this.departureDate);
  }

  getReturnDay(): string {
    return this.getDay(this.returnDate);
  }

  getReturnMonthYear(): string {
    return this.getMonthYear(this.returnDate);
  }

  getReturnDayName(): string {
    return this.getDayName(this.returnDate);
  }

  openDatePicker(dateInput: HTMLInputElement) {
    try {
      dateInput.showPicker();
    } catch (error) {
      dateInput.focus();
    }
  }

  toggleTravellerModal(event: Event) {
    event.stopPropagation();
    this.isTravellerModalOpen = !this.isTravellerModalOpen;
    this.activeCalendar = null;
    this.isHotelGuestsModalOpen = false;
  }

  closeTravellerModal() {
    this.isTravellerModalOpen = false;
  }

  updateTraveller(type: 'adults' | 'children' | 'infants', action: 'add' | 'subtract', event: Event) {
    event.stopPropagation();
    if (action === 'add') {
      this.travellers[type]++;
    } else if (action === 'subtract') {
      if (type === 'adults' && this.travellers[type] > 1) {
        this.travellers[type]--;
      } else if (type !== 'adults' && this.travellers[type] > 0) {
        this.travellers[type]--;
      }
    }
  }

  setFlightClass(event: any) {
    this.flightClass = event.target.value;
  }

  getTotalTravellers(): number {
    return this.travellers.adults + this.travellers.children + this.travellers.infants;
  }

  // Hotel specific methods
  getNightsCount(): number {
    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toggleHotelGuestsModal(event: Event) {
    event.stopPropagation();
    this.isHotelGuestsModalOpen = !this.isHotelGuestsModalOpen;
    this.activeCalendar = null;
    this.isTravellerModalOpen = false;
  }

  closeHotelGuestsModal() {
    this.isHotelGuestsModalOpen = false;
  }

  updateHotelGuest(type: 'adults' | 'children' | 'rooms', action: 'add' | 'subtract', event: Event) {
    event.stopPropagation();
    if (action === 'add') {
      this.hotelGuests[type]++;
    } else if (action === 'subtract') {
      if (type === 'adults' && this.hotelGuests.adults > 1) {
        this.hotelGuests.adults--;
      } else if (type === 'rooms' && this.hotelGuests.rooms > 1) {
        this.hotelGuests.rooms--;
      } else if (type === 'children' && this.hotelGuests.children > 0) {
        this.hotelGuests.children--;
      }
    }
  }

  getTotalHotelGuests(): number {
    return this.hotelGuests.adults + this.hotelGuests.children;
  }
}
