# Goal Description

The objective is to allow the Admin to create a Service or Installation booking on behalf of a customer. Currently, customers can book from their dashboard, but sometimes admins need to create these bookings manually if they receive a call from the customer.

## Open Questions

None at this moment.

## Proposed Changes

### Admin Component Layer

#### [MODIFY] AdminAllBookings.jsx
- Add a "Create Booking" button at the top of the bookings list.
- Integrate the `AdminCreateBookingModal` component and manage its visibility state (`showCreateModal`).
- Fetch the bookings list again after a new booking is created to keep the UI up to date.

#### [NEW] AdminCreateBookingModal.jsx
Create a new modal component that contains a form for the admin to create a booking.
The form will have the following steps / fields:
1. **Select Customer**: Fetches and lists all users with `role === 'Customer'`.
2. **Select Address**: Fetches and lists addresses for the selected customer. Includes logic to select one.
3. **Select Booking Type**: Toggle between "Service" and "Installation".
4. **Conditional Fields based on Booking Type**:
   - For **Service**: Product dropdown, Issue dropdown, Additional Notes. Also calculates the `chargeType` (Free Service, AMC, Chargeable) by fetching the customer's active AMCs and free service validity for the selected address.
   - For **Installation**: Number of Cameras input, Installation Notes. Sets charge type as "Chargeable".
5. **Submit**: Creates a new document in the `bookings` collection with `status: 'Pending'`, including the customer's details (`userId`, `userName`, `userPhone`, etc.). Also creates a notification signal for the customer and the admin.

### Services & Logic

No backend/Firebase logic changes are needed since we use the existing structure for `bookings` and `notification_signals`.

## Verification Plan

### Manual Verification
- Log in as an Admin.
- Go to "Manage Bookings" -> Click "Create Booking".
- Select a Customer, choose their Address.
- Book an Installation -> verify it appears in the bookings list.
- Book a Service -> verify it correctly calculates `chargeType` if the user has an AMC or Free Service, and appears in the bookings list.
- Verify customer receives a notification (signal created).
