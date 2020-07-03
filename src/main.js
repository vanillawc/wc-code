const WCCode = {
  zones: {
    __nextZoneID: 0,
    zones : {},
    get(id){return this.zones[id]},
    save(zone){
      const zoneID = this.__nextZoneID;
      this.__nextZoneID++;
      this.zones[zoneID] = zone
      return zoneID
    },
  },
  languages: {},
}

window.WCCode = WCCode;
export default WCCode;
