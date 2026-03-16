export const state = {

  cities: [],
  offsetMinutes: 0,
  dragCityId: null,
  meetingHour: null,

  timelineDrag: {
    active: false,
    pointerId: null,
    startX: 0,
    startOffset: 0
  }

}

const STORAGE_KEY = "worldTimelineClockState_v3"

const defaultCities = [

  { id:"tokyo", city:"Tokyo", timezone:"Asia/Tokyo" },
  { id:"chicago", city:"Chicago", timezone:"America/Chicago" },
  { id:"milan", city:"Milano", timezone:"Europe/Rome" },
  { id:"london", city:"London", timezone:"Europe/London" },
  { id:"hochiminh", city:"Ho Chi Minh", timezone:"Asia/Ho_Chi_Minh" }

]

export function loadState(){

  const raw = localStorage.getItem(STORAGE_KEY)

  if(!raw){

    state.cities = [...defaultCities]
    state.offsetMinutes = 0

  }else{

    try{

      const parsed = JSON.parse(raw)

      state.cities =
        Array.isArray(parsed.cities) && parsed.cities.length
          ? parsed.cities
          : [...defaultCities]

      state.offsetMinutes =
        Number.isFinite(parsed.offsetMinutes)
          ? parsed.offsetMinutes
          : 0

    }catch{

      state.cities = [...defaultCities]
      state.offsetMinutes = 0

    }

  }

  /* URL共有読み込み */

  const params = new URLSearchParams(location.search)

  const cities = params.get("cities")

  if(cities){

    const list = cities.split(",")

    state.cities =
      defaultCities.filter(c => list.includes(c.id))

  }

}

export function saveState(){

  const payload = {

    cities: state.cities,
    offsetMinutes: state.offsetMinutes

  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(payload)
  )

  /* URL共有 */

  const ids = state.cities.map(c => c.id).join(",")

  history.replaceState(
    null,
    "",
    "?cities=" + ids
  )

}