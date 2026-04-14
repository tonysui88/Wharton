# Topic Analysis Report
Generated: 2026-04-14T19:51:39.985Z
Sample size: 400 reviews

## 1. Discovered Themes
Found **18** themes:

- **Cleanliness Issues** (`cleanliness_issues`): ~25% frequency, typically negative. Examples: _room was dirty; bathroom flooding; dirty towels_
- **Staff Friendliness** (`staff_friendliness`): ~20% frequency, typically mixed. Examples: _staff was very friendly; helpful staff; front desk personnel were rude_
- **Noise Problems** (`noise_problems`): ~18% frequency, typically negative. Examples: _loud neighbours; traffic noise; could hear everything_
- **Location Convenience** (`location_convenience`): ~22% frequency, typically positive. Examples: _very convenient location; close to attractions; easy access to public transport_
- **Room Condition** (`room_condition`): ~20% frequency, typically negative. Examples: _room in total disrepair; outdated furniture; bed was uncomfortable_
- **Breakfast Quality** (`breakfast_quality`): ~15% frequency, typically mixed. Examples: _breakfast was excellent; breakfast buffet is a joke; no variety in breakfast_
- **Check-in Experience** (`check_in_experience`): ~15% frequency, typically mixed. Examples: _check in was fast; waiting on the phone forever; check-in was a hassle_
- **Amenities Availability** (`amenities_availability`): ~12% frequency, typically negative. Examples: _no pool available; no room service; limited amenities_
- **Value for Money** (`value_for_money`): ~14% frequency, typically mixed. Examples: _not worth the price; overpriced for what you get; good value for the price_
- **Maintenance Issues** (`maintenance_issues`): ~16% frequency, typically negative. Examples: _elevators were broken; shower controls missing parts; furniture was beat up_
- **Safety Concerns** (`safety_concerns`): ~10% frequency, typically negative. Examples: _felt unsafe at night; sketchy area; concerns about homeless_
- **Room Service Experience** (`room_service_experience`): ~10% frequency, typically mixed. Examples: _room service was average; no kid's menu; food was uncooked_
- **Pet Friendly Policy** (`pet_friendly_policy`): ~8% frequency, typically mixed. Examples: _pet friendly hotel; no area to walk pets; charged extra for pets_
- **Internet Connectivity** (`internet_connectivity`): ~8% frequency, typically negative. Examples: _internet did not work; wifi was slow; no internet access_
- **Guest Experience** (`guest_experience`): ~12% frequency, typically mixed. Examples: _overall stay was good; enjoyed our stay; would recommend this place_
- **Housekeeping Service** (`housekeeping_service`): ~10% frequency, typically negative. Examples: _housekeeping was terrible; no maid service; room not cleaned_
- **Parking Availability** (`parking_availability`): ~10% frequency, typically mixed. Examples: _limited parking space; easy parking; parking was a nightmare_
- **Reservation Issues** (`reservation_issues`): ~10% frequency, typically negative. Examples: _reservation got changed; charged extra night; property did not have my reservation_

## 2. Reconciliation with Existing 15

✅ **KEEP** `cleanliness` — Cleanliness
   > Existing topic covers cleanliness, aligns with discovered theme on cleanliness issues.
✅ **KEEP** `location` — Location & Neighborhood
   > Existing topic covers location, aligns with discovered theme on location convenience.
🔀 **MERGE** `food_breakfast` — Food & Breakfast
   > Merge with discovered theme on breakfast quality as it falls under food-related experiences.
✅ **KEEP** `wifi_internet` — WiFi & Internet
   > Existing topic covers internet connectivity, aligns with discovered theme on internet issues.
✅ **KEEP** `parking` — Parking
   > Existing topic covers parking availability, aligns with discovered theme on parking issues.
❌ **REMOVE** `pool_fitness` — Pool & Fitness
   > No relevant discovered themes or significant reviews related to pool or fitness amenities.
✅ **KEEP** `checkin_checkout` — Check-in & Check-out
   > Existing topic covers check-in experience, aligns with discovered theme on check-in issues.
🔀 **MERGE** `noise` — Noise & Quiet
   > Merge with discovered theme on noise problems as it directly relates to noise issues.
🔀 **MERGE** `room_comfort` — Room Size & Comfort
   > Merge with discovered theme on room condition as it relates to comfort and quality of the room.
✅ **KEEP** `bathroom` — Bathroom
   > Existing topic covers bathroom issues, relevant to discovered themes on room condition.
🔀 **MERGE** `staff_service` — Staff & Service
   > Merge with discovered theme on staff friendliness as it relates to overall service experience.
✅ **KEEP** `value` — Value for Money
   > Existing topic covers value for money, aligns with discovered theme on value perceptions.
❌ **REMOVE** `spa_wellness` — Spa & Wellness
   > No relevant discovered themes or significant reviews related to spa or wellness amenities.
❌ **REMOVE** `accessibility` — Accessibility
   > No relevant discovered themes or significant reviews related to accessibility issues.
❌ **REMOVE** `eco_sustainability` — Eco & Sustainability
   > No relevant discovered themes or significant reviews related to eco-sustainability.

**Final topic count: 11**

## 3. Extracted Keywords

- **cleanliness** (16 keywords): clean rooms, disgusting, dirty, moldy, not clean, leftover food, dust, smelly bathroom...
- **location** (15 keywords): great location, close to activities, next to train station, busy part of town, near restaurants, convenient location, close to the beach, not safe at night...
- **food_breakfast** (15 keywords): no breakfast included, good meal options, breakfast room small, average breakfast, not offered, breakfast was great, good food, no food service...
- **wifi_internet** (15 keywords): poor wifi, no internet, wifi not working, limited wifi, internet pathetic, no phone service, wifi issues, unsecured network...
- **parking** (14 keywords): no parking, horrendous parking, not enough spots, parked at gas station, parking arrangements off site, complicated parking, free parking, private parking garage...
- **checkin_checkout** (14 keywords): check-in was quick, rude check-in, check-in not until 3, system was down, check-in process, late check-in, check-out was a hassle, check-in issues...
- **noise** (15 keywords): very noisy, traffic noise, loud, noisy at night, could hear talking, thin walls, loud guests, noise from hallway...
- **room_comfort** (15 keywords): uncomfortable room, small room, not comfortable, bed was hard, room size, room was hot, room was dated, noisy room...
- **bathroom** (15 keywords): bathroom was dirty, mold in bathroom, shower not clean, toilet issues, bathroom lights flickered, no hot water, bathroom needs updating, smelly bathroom...
- **staff_service** (15 keywords): friendly staff, rude staff, helpful staff, staff was unhelpful, staff not available, staff was excellent, staff was accommodating, poor service...
- **value** (15 keywords): not worth the price, good value, affordable, overpriced, poor value for money, value for the price, not worth it, expensive for what you get...

## 4. Persona Analysis

**Inferred distribution:** {"business":5,"family":7,"couple":5,"solo":3,"unknown":0}
**Confidence:** medium
**Notes:** The persona weights are based on the frequency and sentiment of the reviews. The confidence is medium due to the limited number of reviews for some personas.

- **business**: wifi_internet=2, cleanliness=1.5, room_comfort=1.5, checkin_checkout=1.4, staff_service=1.4
- **family**: location=2, room_comfort=2, cleanliness=1.8, value=1.7, bathroom=1.6
- **couple**: location=1.8, room_comfort=1.7, staff_service=1.6, food_breakfast=1.5, value=1.5
- **solo**: wifi_internet=2, cleanliness=1.6, location=1.5, staff_service=1.5, room_comfort=1.4
