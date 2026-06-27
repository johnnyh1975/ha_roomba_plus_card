function ge(e,n,t,r,o){let s=d=>!!e.states[`sensor.${n}_${d}`],a=d=>!!e.states[`select.${n}_${d}`],l=d=>!!e.states[`binary_sensor.${n}_${d}`],i=d=>!!e.states[`image.${n}_${d}`],c=s("mop_pad"),p=s("brush_remaining_hours");return{hasArea:s("area_cleaned_today"),hasBrush:p,hasPad:c,hasWater:s("mop_tank_level"),hasCleanBase:s("clean_base_status"),hasZones:a("smart_zone_select")||a("zone_select"),hasSmartZones:a("smart_zone_select"),hasProblemZone:s("problem_zone"),hasLifetimeArea:s("cleaning_analytics_30d"),hasWearRate:s("filter_wear_rate"),isMop:c&&!p,hasMissionActive:l("mission_active"),hasMissionPhase:s("phase"),hasCleaningSpeedTrend:s("cleaning_performance"),hasBatteryRetention:s("battery_capacity_retention"),hasWifiFloor:s("wifi_health"),hasCoveragePct:s("recent_coverage_pct"),hasBatteryEol:s("estimated_battery_eol"),hasConsecutiveSkips:s("consecutive_clean_skips"),hasMopBehavior:s("mop_behavior"),hasCoverageImage:i("coverage_map"),hasWifiSignal:r?.wifi_signal!=null,hasRoomCoverage:r!=null&&"room_coverage"in r,hasDirtDensity:o!=null&&"dirt_density"in o,hasRobotSelectorHelper:!!t.robot_selector_helper&&!!e.states[t.robot_selector_helper],hasCleanedRooms:Array.isArray(e.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms)&&(e.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:l("demand_clean_blocked"),hasEnergyConsumption:s("total_energy_consumed"),hasOptimalWindow:s("optimal_clean_window"),hasRobotHealthScore:s("robot_health_score"),hasMaintenanceCalendar:s("wheel_last_cleaned")||s("contact_last_cleaned")||s("bin_last_cleaned"),hasMissionProgressSensor:s("mission_progress"),hasAlignment:(()=>{let d=e.states[`image.${n}_coverage_map`]?.attributes?.rooms;return!!d&&typeof d=="object"&&Object.keys(d).length>0})(),hasFavorites:Object.keys(e.states).some(d=>d.startsWith(`button.${n}_fav_`))}}var ue=class{constructor(n,t,r){this.hass=n;this.entryId=null;this.entityId=r??t.entity}updateHass(n){this.hass=n}async fetchSummary(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,o=await this.hass.fetchWithAuth(r);if(!o.ok)throw new Error(`${o.status}`);return o.json()}async fetchRecords(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,o=await this.hass.fetchWithAuth(r);return o.ok?o.json():[]}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}async fetchHazards(){let t=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,r=await this.hass.fetchWithAuth(t);return r.ok?r.json():[]}async fetchHousehold(n){let t=`/api/roomba_plus/household?days=${n}`,r=await this.hass.fetchWithAuth(t);return r.ok?r.json():null}};function b(e){return String(e??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function K(e,n="en"){let t=Date.now()-new Date(e).getTime(),r=Math.floor(t/6e4);try{let o=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(r<1)return o.format(0,"minute");if(r<60)return o.format(-r,"minute");let s=Math.floor(r/60);if(s<24)return o.format(-s,"hour");let a=Math.floor(s/24);return a<30?o.format(-a,"day"):o.format(-Math.floor(a/30),"month")}catch{if(r<1)return"just now";if(r<60)return`${r}m ago`;let o=Math.floor(r/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}}var oe={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},Ce="\u{1F4CD}";var be={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},Te={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function fe(e,n,t,r,o=!1){if(n.show_settings===!1)return"";let s=t,a=e.states[`switch.${s}_edge_clean`],l=e.states[`switch.${s}_always_finish`],i=e.states[`select.${s}_carpet_boost_select`];if(!a&&!l&&!i)return"";let c="";if(r){let h=a?.state==="on",v=l?.state==="on",S=i?i.attributes.options??[]:[];c=`
      <div class="rpc-settings-panel">
        ${a?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${h?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_edge_clean"
                    aria-pressed="${h}">
              ${h?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${l?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${v?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_always_finish"
                    aria-pressed="${v}">
              ${v?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${s}_carpet_boost_select"
                    data-cycle-options="${b(JSON.stringify(S))}"
                    data-cycle-current="${b(i.state)}">
              ${b(i.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${o?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${o?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${r}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${r?"\u25B2":"\u25BC"}</span>
    </button>
    ${c}
  `}function ve(e){let{hass:n,config:t,caps:r,robotName:o,selectedRooms:s,passes:a,isSending:l,sendError:i,settingsPanelOpen:c,includeSettingsPanel:p=!0}=e;if(!r.hasZones||t.show_rooms===!1)return"";let d=o,h=n.states[`select.${d}_smart_zone_select`],v=n.states[`select.${d}_zone_select`],S=h??v;if(!S)return"";let m=S.attributes.options??[];if(m.length===0)return"";let u=n.states[`button.${d}_repeat_mission`],f=!!u&&u.state!=="unavailable",y=n.states[`select.${d}_cleaning_passes`],w=r.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",C=s.size,E='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',H=(()=>{let Z=r.hasSmartZones?`select.${o}_smart_zone_select`:`select.${o}_zone_select`,N=n.states[Z]?.attributes?.region_icons;return N&&typeof N=="object"&&!Array.isArray(N)?N:{}})(),A=m.map(Z=>{let N=s.has(Z),J=H[Z],ie=J?oe[J]??Ce:"",ee=ie?`${ie} ${b(Z)}`:b(Z);return`<button class="rpc-room-chip${N?" rpc-room-chip--selected":""}"
      data-room="${b(Z)}" aria-pressed="${N}">${ee}</button>`}).join(""),P="";if(y){let Z=a;P=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(N=>`<button class="rpc-pass-chip${Z===N?" rpc-pass-chip--selected":""}"
            data-pass="${N}"
            data-pass-option="${b(be[N]??N)}">${N}</button>`).join("")}
      </div>
    `}let V=p?fe(n,t,o,c):"";return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${A}
        ${C>0?`<span class="rpc-selected-count">${C} selected</span>`:""}
      </div>
      ${P}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${C===0||l?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${C===0||l?"disabled":""}
                aria-label="${w}">
          ${l?E+" Sending\u2026":w}
        </button>
        ${f?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${i?`<div class="rpc-send-error">${b(i)}</div>`:""}
      ${V}
    </div>
  `}function Ee(e,n){return Math.min(100,Math.max(0,Math.round(e/n*100)))}function He(e,n){return n==="battery"?e>20?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?e>40?"var(--rpc-green)":e>20?"var(--rpc-amber)":"var(--rpc-red)":e>50?"var(--rpc-green)":e>10?"var(--rpc-amber)":"var(--rpc-red)"}function st(e,n){let t=n/90;if(!t)return"";let r=e/t;return r>1.2?"\u2191":r<.8?"\u2193":"\u2192"}function Re(e){let n=parseInt(e,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:e==="Empty"?"Bag full \u2014 replace soon":e==="Full"?"Bag has capacity":b(e)}function at(e){return e>=80?"var(--rpc-green)":e>=60?"var(--rpc-amber)":"var(--rpc-red)"}function ot(e){return e>=80?"GOOD":e>=60?"FAIR":"NEEDS ATTENTION"}function nt(e,n,t,r){if(!n.hasRobotHealthScore)return"";let o=e.states[`sensor.${t}_robot_health_score`];if(!o)return"";if(o.state==="unknown"||o.state==="unavailable")return`
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating\u2026 (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
        ${r?"Hide details \u25B2":"Show details \u25BC"}
      </button>
    `;let a=Math.round(parseFloat(o.state));if(isNaN(a))return"";let l=at(a),i=ot(a);return`
    <div class="rpc-health-score" aria-label="Robot health ${a} out of 100, ${i}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${l}">${a}</span>
      <span class="rpc-health-score-band" style="color:${l}">\u25CF ${i}</span>
    </div>
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
      ${r?"Hide details \u25B2":"Show details \u25BC"}
    </button>
  `}function it(e,n){let r=e.states[`sensor.${n}_last_mission_result`]?.attributes?.consecutive_anomalous;return typeof r!="number"||r<2?"":`
    <div class="rpc-anomaly-banner" role="alert">
      \u26A0 Last ${r} missions were anomalous \u2014 check brushes and filter
    </div>
  `}function lt(e,n,t,r){if(!n.hasMaintenanceCalendar)return"";let o=[{key:"wheel",label:"Wheels",entityId:`sensor.${t}_wheel_last_cleaned`,service:"roomba_plus.reset_wheel_cleaning"},{key:"contact",label:"Contacts",entityId:`sensor.${t}_contact_last_cleaned`,service:"roomba_plus.reset_contact_cleaning"},{key:"bin",label:"Bin",entityId:`sensor.${t}_bin_last_cleaned`,service:"roomba_plus.reset_bin_cleaning"}].filter(a=>!!e.states[a.entityId]);return o.length===0?"":`
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${o.map(a=>{let l=e.states[a.entityId],i=r.openMaintPopover===a.key,p=l.state!=="unavailable"&&l.state!=="unknown"?`Cleaned ${K(l.state,e.language)}`:"Never recorded";return`
      <div class="rpc-maint-row" data-maint="${a.key}" role="button" aria-expanded="${i}" tabindex="0"
           aria-label="${a.label} \u2014 ${p}">
        <span class="rpc-maint-label">${a.label}</span>
        <span class="rpc-maint-val">${p}</span>
      </div>
      ${i?`
        <div class="rpc-popover">
          <div class="rpc-popover-header">
            <span>${a.label}</span>
            <button class="rpc-popover-close" data-close-maint="${a.key}" aria-label="Close">\xD7</button>
          </div>
          <div class="rpc-popover-divider"></div>
          <div class="rpc-popover-sub">Reset via Developer Tools \u2192 Services:</div>
          <div class="rpc-maint-service">${a.service}</div>
        </div>
      `:""}
    `}).join("")}
  `}function Me(e,n,t,r,o){if(n.show_health===!1)return"";let s=r,a=[];e.states[`sensor.${s}_filter_remaining_hours`]&&a.push({key:"filter",label:"Filter",sensorId:`sensor.${s}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${s}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${s}_filter_last_replaced`}),t.hasBrush&&e.states[`sensor.${s}_brush_remaining_hours`]&&a.push({key:"brush",label:"Brush",sensorId:`sensor.${s}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:t.hasWearRate?`sensor.${s}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${s}_brush_last_replaced`}),t.hasPad&&e.states[`sensor.${s}_pad_days_until_due`]&&a.push({key:"pad",label:"Pad",sensorId:`sensor.${s}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:t.hasWearRate?`sensor.${s}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${s}_pad_last_replaced`}),t.hasWater&&e.states[`sensor.${s}_mop_tank_level`]&&a.push({key:"tank",label:"Tank",sensorId:`sensor.${s}_mop_tank_level`,thresholdAttr:null,type:"tank"});let l=e.states[`sensor.${s}_battery`]?`sensor.${s}_battery`:null,i=l?void 0:e.states[`vacuum.${s}`]?.attributes?.battery_level;(l||i!==void 0)&&a.push({key:"battery",label:"Battery",sensorId:l??"",thresholdAttr:null,type:"battery",rawPct:i}),t.hasCleanBase&&e.states[`sensor.${s}_clean_base_status`]&&a.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${s}_clean_base_status`,thresholdAttr:null,type:"cleanbase"});let c=it(e,s);if(a.length===0&&!t.hasRobotHealthScore&&!t.hasMaintenanceCalendar&&!c)return"";let p=a.map(u=>ct(u,e,s,o)).join(""),d="";if(t.hasBatteryRetention){let u=e.states[`sensor.${s}_battery_capacity_retention`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let f=Math.round(parseFloat(u.state));if(!isNaN(f)){let y=f>85?"var(--rpc-green)":f>70?"var(--rpc-amber)":"var(--rpc-red)",_=e.states[`sensor.${s}_battery_cycles`],w=_?parseInt(_.state,10):NaN,C=isNaN(w)?"":`${w} charge cycle${w!==1?"s":""}`,E="";if(t.hasBatteryEol){let P=e.states[`sensor.${s}_estimated_battery_eol`];if(P&&P.state!=="unavailable"&&P.state!=="unknown"){let V=parseInt(P.state,10);isNaN(V)||(E=V>0?`<div class="rpc-retention-eol">Battery life: ~${V} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let H=o.openPopover==="retention",A=H?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${f}% of original capacity</div>
              ${C?`<div class="rpc-popover-sub">${C}</div>`:""}
              ${E}
            </div>
          </div>`:"";d=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${H}" tabindex="0"
               aria-label="Bat. Health \u2014 ${f}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${f}%;background:${y}"></span></span>
            <span class="rpc-bar-pct" style="color:${y}">${f}%</span>
          </div>
          ${A}`}}}let h="";if(t.hasCoveragePct){let u=e.states[`sensor.${s}_recent_coverage_pct`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let f=e.states[`sensor.${s}_missions_last_30d`],y=f?parseInt(f.state,10):NaN;if(isNaN(y)||y<10)h=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let _=Math.min(100,Math.round(parseFloat(u.state)));if(!isNaN(_)){let w=_>=85?"var(--rpc-green)":_>=65?"var(--rpc-amber)":"var(--rpc-red)",C=o.openPopover==="coverage",E=isNaN(y)?"":`Based on ${y} mission${y!==1?"s":""} in the last 30 days.`,H=C?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${_}% of floor area covered on the last mission.</div>
                ${E?`<div class="rpc-popover-sub">${E}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";h=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${C}" tabindex="0"
                 aria-label="Coverage ${_}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${_}%;background:${w}"></span></span>
              <span class="rpc-bar-pct" style="color:${w}">${_}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${H}`}}}}let v=d||h?`<div class="rpc-health-battery-sep"></div>${d}${h}`:"",S="";if(t.hasEnergyConsumption){let u=e.states[`sensor.${s}_total_energy_consumed`];if(u&&u.state!=="unavailable"&&u.state!=="unknown"){let f=parseFloat(u.state);if(!isNaN(f)){let y=e.states[`sensor.${s}_battery_cycles`],_=y?parseInt(y.state,10):NaN,w=o.openPopover==="energy",C=w?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${f.toFixed(1)} kWh used${isNaN(_)?"":` over ${_} charge cycles`}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>`:"";S=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${w}" tabindex="0"
               aria-label="Lifetime energy ~${f.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${f.toFixed(1)} kWh lifetime</span>
          </div>
          ${C}`}}}let m="";if(t.isMop){let u=e.states[`sensor.${s}_mop_pad`],f=t.hasMopBehavior?e.states[`sensor.${s}_mop_behavior`]:null,y=[];u&&u.state!=="unknown"&&u.state!=="unavailable"&&y.push(b(u.state)),f&&f.state!=="unknown"&&f.state!=="unavailable"&&y.push(`${b(f.state)} intensity`),y.length&&(m=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${y.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${c}
      ${nt(e,t,s,o.healthDetailsExpanded)}
      ${t.hasRobotHealthScore&&!o.healthDetailsExpanded?"":`
        ${p}
        ${v}
        ${S}
        ${m}
      `}
      ${lt(e,t,s,o)}
    </div>
  `}function ct(e,n,t,r){let o=r.openPopover===e.key;if(e.type==="cleanbase"){let h=n.states[e.sensorId];return h?`
      <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${o}" tabindex="0"
           aria-label="${e.label}">
        <span class="rpc-bar-label">${e.label}</span>
        <span class="rpc-bar-cleanbase-state">${Re(h.state)}</span>
      </div>
      ${o?dt(e.label,h.state):""}
    `:""}let s=0,a="",l="",i=null;if(e.rawPct!==void 0)s=Math.min(100,Math.max(0,e.rawPct)),a=`${Math.round(s)}%`;else{let h=n.states[e.sensorId];if(!h)return"";let v=parseFloat(h.state);if(isNaN(v))return"";if(e.type==="tank"||e.type==="battery")s=Math.min(100,Math.max(0,v)),a=`${Math.round(s)}%`;else{if(i=e.thresholdAttr?h.attributes[e.thresholdAttr]:null,!i)return"";s=Ee(v,i),a=`${s}%`,l=`${Math.round(v)}h`}}let c=He(s,e.type),p="";if(e.wearSensorId&&i){let h=n.states[e.wearSensorId];h&&h.state!=="unknown"&&h.state!=="unavailable"&&(p=st(parseFloat(h.state),i))}let d=e.rawPct!==void 0?{state:String(Math.round(e.rawPct)),attributes:{}}:n.states[e.sensorId];return`
    <div class="rpc-bar-row" data-bar="${e.key}" role="button" aria-expanded="${o}" tabindex="0"
         aria-label="${e.label} \u2014 ${a}">
      <span class="rpc-bar-label">${e.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${s}%;background:${c}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${c}">${a}</span>
      ${l?`<span class="rpc-bar-hours">${l}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${c}">${p}</span>`:""}
    </div>
    ${o&&d?pt(e,d,i,n,r):""}
  `}function pt(e,n,t,r,o){let s=parseFloat(n.state),a=t?Ee(s,t):Math.min(100,Math.max(0,s)),l=He(a,e.type),i=o.resetting===e.key,c=e.lastReplacedId?r.states[e.lastReplacedId]:null,p="";c&&c.state!=="unavailable"&&c.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(c.state).toLocaleDateString(r.language)} (${K(c.state,r.language)})</span>
      </div>`);let d="";if(e.wearSensorId&&!o.legendShown){let v=r.states[e.wearSensorId];v&&v.state!=="unknown"&&v.state!=="unavailable"&&(d=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${b(e.label)}</span>
        <button class="rpc-popover-close" data-close="${e.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${t?`<div class="rpc-popover-row"><span>Threshold</span><span>${t} ${e.unit??"h"}</span></div>`:""}
      ${t?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(s)} ${e.unit??"h"} (${a}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${a}%;background:${l}"></div>
      </div>
      ${d}
      ${e.resetService?`
        <button class="rpc-btn rpc-btn-secondary${i?" rpc-btn-loading":""}"
                data-reset="${e.key}" data-service="${e.resetService}"
                ${i?"disabled":""}>
          ${i?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${o.resetError===e.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function dt(e,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${b(e)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${Re(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function ze(e,n){if(!e||e==="unavailable"||e==="unknown")return"No schedule set";try{let t=new Date(e);return t.toLocaleDateString(n,{weekday:"short"})+" "+t.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return b(e)}}function ut(e,n){if(!e||e==="unavailable"||e==="unknown")return"";try{let t=new Date(e);if(isNaN(t.getTime()))return"";let r=t.toLocaleDateString(n,{weekday:"short"}),o=t.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${r} ~${o}`}catch{return""}}function Ae(e,n,t,r,o){if(n.show_schedule===!1)return"";let s=r,a=e.states[`sensor.${s}_next_clean`],l=e.states[`binary_sensor.${s}_schedule_hold_active`],i=e.states[`sensor.${s}_presence_clean_opportunities_7d`],c=e.states[`sensor.${s}_presence_clean_utilisation_7d`],p=e.states[`sensor.${s}_next_likely_clean_window`],d=!!i&&!!c&&i.state!=="unknown"&&i.state!=="unavailable"&&c.state!=="unknown"&&c.state!=="unavailable",h=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!a&&!l&&!d&&!h&&!t.hasOptimalWindow)return"";let v="";if(l){let _=l.state==="on",C=l.attributes.source==="presence_manager",E="rpc-badge-green",H="Schedule active",A="";_&&(C?(E="rpc-badge-blue",H="Away hold",A="\u{1F3C3}"):(E="rpc-badge-amber",H="Hold active",A="\u{1F512}")),v=`
      <button class="rpc-hold-badge ${E}"
              data-hold-action="${C?"tooltip":"toggle"}"
              aria-label="${b(H)}">
        ${o.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${A} ${H}`}
      </button>
      ${o.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let S="";if(h){let _=ut(p.state,e.language);_&&(S=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${_}</span>
        </div>
      `)}let m="";if(t.hasOptimalWindow){let _=e.states[`sensor.${s}_optimal_clean_window`];if(_&&_.state!=="unavailable"&&_.state!=="unknown"){let w=ze(_.state,e.language);w&&w!=="No schedule set"&&(m=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${w}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let u="",f=n.presence_entities??[];if(f.length>0){let _=f.map(w=>{let C=e.states[w];if(!C)return"";let E=C.state==="home",H=C.attributes.friendly_name??w,A=b(H.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${E?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${A}
        <span class="rpc-presence-label">${E?"home":"away"}</span>
      </span>`}).join("");_&&(u=`<div class="rpc-presence-row">${_}</div>`)}let y="";if(d){let _=parseInt(i.state,10),w=parseInt(c.state,10);if(!isNaN(_)&&!isNaN(w)){let C=c.attributes.cleans_7d,E=C??Math.round(_*w/100),H=`${_} opportunit${_!==1?"ies":"y"} this week`;y=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${E} clean${E!==1?"s":""}`} \xB7 ${H}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${a?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${ze(a.state,e.language)}</span>
            </div>`:""}
          ${S}
          ${m}
        </div>
        ${v}
      </div>
      ${u}
      ${y}
    </div>
  `}var De={completed:"#2d9c4f",stuck:"#d97706",error:"#dc2626",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},U=24,ye=2,de=20,_e=18,X=U+ye;function Ne(e=7){return de+e*X-ye}function Le(e){return _e+e*X-ye+4}function mt(e,n){return e.toLocaleDateString(n,{month:"short",day:"numeric"})}function Pe(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Ie(e,n,t,r="en-US",o=!1){let s=new Map;for(let m of e)s.set(m.date,m);let a=new Date,l=new Date(a);l.setDate(a.getDate()-(n-1));let i=(l.getDay()+6)%7;l.setDate(l.getDate()-i);let c=Math.ceil((n+i)/7),p=[];for(let m=0;m<c;m++)for(let u=0;u<7;u++){let f=new Date(l);f.setDate(l.getDate()+m*7+u),!(f>a)&&p.push({date:f,summary:s.get(Pe(f))??null,col:u,row:m})}let d=Ne(),h=Le(c),v=["Mo","Tu","We","Th","Fr","Sa","Su"],S=`<svg width="${d}" height="${h}" viewBox="0 0 ${d} ${h}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let m=0;m<7;m++){let u=de+m*X+U/2;S+=`<text x="${u}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${v[m]}</text>`}for(let m of p){let u=de+m.col*X,f=_e+m.row*X,y=m.summary?.result??"none",_=De[y]??De.none,w=m.summary?.total??0,C=mt(m.date,r);if(w===0?C+=": no missions":w===1?C+=`: 1 mission, ${y}`:C+=`: ${w} missions, ${y}`,m.col===0){let H=m.date.getDate();S+=`<text x="${de-3}" y="${f+U/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${H}</text>`}let E="";if(o&&m.summary?.relative_to_baseline!=null){let H=m.summary.relative_to_baseline;E=` opacity="${Math.min(1,Math.max(.5,.5+H/4)).toFixed(2)}"`}if(S+=`<g role="gridcell" aria-label="${C}" data-date="${Pe(m.date)}" data-result="${y}" data-total="${w}" style="cursor:pointer">`,S+=`<rect x="${u-2}" y="${f-2}" width="${U+4}" height="${U+4}" fill="transparent" rx="4"/>`,S+=`<rect x="${u}" y="${f}" width="${U}" height="${U}" fill="${_}" rx="3"${E}/>`,w>1){let H=Math.min(w,3);for(let A=0;A<H;A++){let P=u+U-4-A*5,V=f+U-3;S+=`<circle cx="${P}" cy="${V}" r="2" fill="rgba(255,255,255,0.75)"/>`}}S+="</g>"}return S+="</svg>",S}function Be(e){if(!e||e.length!==5)return null;let n=e.reduce((r,o)=>r+o,0);if(n===0)return null;let t=e.reduce((r,o,s)=>r+s*o,0)/n;return Math.round(t/4*100*10)/10}function Oe(e){if(!e||e.length===0)return[];if(e.length===5){let t=e.reduce((r,o)=>r+o,0);return t===0?[0,0,0,0,0]:e.map(r=>Math.round(r/t*100))}return e.every(t=>t<=4)?e.map(t=>t*25):e}function xe(e,n,t,r,o,s){let a=((e-t)/(r-t)*100).toFixed(1)+"%",l=((s-n)/(s-o)*100).toFixed(1)+"%";return{left:a,top:l}}function Fe(e,n,t,r,o,s){let a=(e-t)/(r-t)*100,l=(s-n)/(s-o)*100;return{x:a,y:l}}function je(e){return e<=4?e*25:e}function We(e,n){if(!e||e.length===0)return"";let t=7,r=e.length<=t?[...e]:Array.from({length:t},(h,v)=>e[Math.round(v/(t-1)*(e.length-1))]),o=Math.max(...r,1),s=r.length,a=6,l=2,i=s*a+(s-1)*l,c=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",d="";for(let h=0;h<s;h++){let v=h*(a+l),S=Math.max(2,Math.round(r[h]/o*c)),m=c-S;d+=`<rect x="${v}" y="${m}" width="${a}" height="${S}" fill="${p}" rx="1"/>`}return`<svg width="${i}" height="${c}" viewBox="0 0 ${i} ${c}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${d}</svg>`}function qe(e=4){let n=Ne(),t=Le(e),r=["Mo","Tu","We","Th","Fr","Sa","Su"],o=`<svg width="${n}" height="${t}" viewBox="0 0 ${n} ${t}" xmlns="http://www.w3.org/2000/svg">`;o+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let s=0;s<7;s++){let a=de+s*X+U/2;o+=`<text x="${a}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${r[s]}</text>`}for(let s=0;s<e;s++)for(let a=0;a<7;a++){let l=de+a*X,i=_e+s*X;o+=`<rect x="${l}" y="${i}" width="${U}" height="${U}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(s*7+a)*30}ms"/>`}return o+="</svg>",o}function Ze(e,n,t){let r=t,o=[],s=e.states[`sensor.${r}_last_error_code`];if(s&&s.state!=="0"&&s.state!==""&&s.state!=="unknown"&&s.state!=="unavailable"){let i=b(s.attributes.label??`Error ${s.state}`),c=b(s.attributes.description??""),p=b(s.attributes.action??""),d=[c,p].filter(Boolean).join(" ")||void 0;o.push({priority:1,text:`Error: ${i}`,subtext:d,category:"none"})}let a=e.states[`binary_sensor.${r}_maintenance_due`];if(a&&a.state==="on"){let i=e.states[`sensor.${r}_readiness`]?.state??"",c="Maintenance due";i==="bin_full"||i==="Bin Full"?c="Bin full \u2014 empty to continue":i&&i!=="Ready"&&i!=="unknown"&&i!=="unavailable"&&(c="Robot not ready \u2014 check the app"),o.push({priority:2,text:c,category:"health"})}if(n.hasWearRate){let i=e.states[`sensor.${r}_filter_wear_rate`],c=e.states[`sensor.${r}_filter_remaining_hours`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"&&c){let h=c.attributes.threshold_hours,v=parseFloat(i.state)/(h/90);v>1.5&&o.push({priority:3,text:`Filter wearing ${v.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup.",category:"health"})}let p=e.states[`sensor.${r}_brush_wear_rate`],d=e.states[`sensor.${r}_brush_remaining_hours`];if(p&&p.state!=="unknown"&&p.state!=="unavailable"&&d){let h=d.attributes.threshold_hours,v=parseFloat(p.state)/(h/90);v>1.5&&o.push({priority:4,text:`Brush wearing ${v.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles.",category:"health"})}}let l=e.states[`sensor.${r}_nav_quality`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let i=parseInt(l.state,10);!isNaN(i)&&i<60&&o.push({priority:5,text:`Navigation quality low (${i}/100)`,subtext:"Check lighting or move obstacles in the cleaning area.",category:"health"})}if(n.hasConsecutiveSkips){let i=e.states[`sensor.${r}_consecutive_clean_skips`];if(i&&i.state!=="unknown"&&i.state!=="unavailable"){let c=parseInt(i.state,10);if(!isNaN(c)&&c>0){let p=`Robot blocked from cleaning ${c} consecutive time${c!==1?"s":""}`;o.push({priority:6,text:p,subtext:"Check blocking sensors or robot placement.",category:"health"})}}}if(n.hasWifiFloor){let i=e.states[`sensor.${r}_wifi_health`],c=i?.attributes?.weakest_bucket_observed;if(i&&typeof c=="number"&&!isNaN(c)){let p=je(c);p<50&&o.push({priority:7,text:`Wi-Fi signal dropped to ${p}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender.",category:"history"})}}return o}function $e(e,n,t,r){return Ze(e,n,t).some(o=>o.category===r)}function Ve(e,n,t,r){if(n.show_alerts===!1)return"";let o=Ze(e,t,r);if(o.length===0)return"";let s=o.sort((a,l)=>a.priority-l.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${s.text}</div>
          ${s.subtext?`<div class="rpc-alert-sub">${s.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function Ue(e,n){return n?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function ht(e){return e==="robot_learned"?"\u{1F6A7}":e==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}function gt(e){let n=e.room_name?` \xB7 ${e.room_name}`:"";return e.source==="stuck_events"?`Stuck hotspot${e.stuck_count?` (${e.stuck_count}\xD7)`:""}${n}`:e.source==="robot_learned"?`Robot-detected obstacle${n}`:e.source==="keepout"?`Keep-out zone${n}`:"Hazard"}function we(e,n,t,r,o,s){if(n.show_history===!1)return"";let a=r,l=n.history_days??28,i=n.area_unit??"auto",c=i==="m2"||i==="auto"&&s,{historyTab:p,hazards:d,mapSelectedRooms:h,suppressSubTabToggle:v}=o,S=e.states[`vacuum.${a}`]?.attributes??{},m=S.region_icons??{},u=S.last_cleaned_rooms??[],f=S.mission_destination??null,y=new Date().toLocaleDateString("en-CA"),_=o.openDay===y,w=e.states[`sensor.${a}_clean_streak`],C=e.states[`sensor.${a}_completion_rate_30d`],E=w?parseInt(w.state,10):0,H=C?parseInt(C.state,10):NaN,A="",P=[];if(E>0&&P.push(`\u{1F525} ${E}-day streak`),isNaN(H)||P.push(`${H}% completion rate`),t.hasCleaningSpeedTrend){let R=e.states[`sensor.${a}_cleaning_performance`]?.attributes?.trend;R==="declining"?P.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):R==="improving"&&P.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}P.length&&(A=`<div class="rpc-history-summary">${P.map((W,R)=>R===0?W:`<span class="rpc-summary-sep">\xB7</span>${W}`).join("")}</div>`);let V=t.hasCoverageImage&&!v?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",Z="";if(t.hasCoverageImage&&p==="coverage"){let R=e.states[`image.${a}_coverage_map`]?.attributes??{},z=R.x_min_mm,D=R.x_max_mm,F=R.y_min_mm,O=R.y_max_mm,x=R.entity_picture,q=R.last_mission_end,I=z!=null&&D!=null&&F!=null&&O!=null,te=I?d.map(L=>{let Y=xe(L.x_mm,L.y_mm,z,D,F,O),ae=b(gt(L)),j=ht(L.source);return`<div class="rpc-hazard-pin rpc-pin-${L.source}" style="left:${Y.left};top:${Y.top}" title="${ae}" aria-label="${ae}">${j}</div>`}).join(""):"",le=!I&&x?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",ce=q?`<div class="rpc-coverage-updated">Updated ${K(q,e.language)}</div>`:"",me=d.some(L=>L.source==="stuck_events"),pe=d.some(L=>L.source==="robot_learned"),re=d.some(L=>L.source==="keepout"),se=[me?"<span>\u{1F4CD}</span> Stuck hotspot":"",pe?"<span>\u{1F6A7}</span> Robot obstacle":"",re?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" "),Q="";if(I&&t.hasAlignment){let L=R.rooms??{},Y=Object.values(L).map(M=>{if(!M.outline||M.outline.length<3)return"";let B=M.outline.map(([k,$])=>{let T=Fe(k,$,z,D,F,O);return`${T.x.toFixed(1)},${T.y.toFixed(1)}`}).join(" ");return`<polygon class="rpc-room-poly${h?.has(M.name)??!1?" rpc-room-poly--selected":""}"
          points="${B}" data-room-poly="${b(M.name)}" />`}).join(""),ae=(()=>{let M=t.hasSmartZones?`select.${a}_smart_zone_select`:`select.${a}_zone_select`,B=e.states[M]?.attributes?.region_areas_m2;return B&&typeof B=="object"&&!Array.isArray(B)?B:{}})(),j=Object.values(L).map(M=>{let B=xe(M.x,M.y,z,D,F,O),g=oe[M.icon]??"",k=h?.has(M.name)??!1,$=ae[M.name],T=typeof $=="number"&&!isNaN($)?` / ${$.toFixed(1)} m\xB2`:"";return`<div class="rpc-room-label${k?" rpc-room-label--selected":""}"
          style="left:${B.left};top:${B.top}" data-room-label="${b(M.name)}">
          ${g?`${g} `:""}${b(M.name)}${b(T)}
        </div>`}).join("");Q=`
        <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          ${Y}
        </svg>
        ${j}
      `}Z=x?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${x}" alt="Coverage map" />
          ${Q}
          ${te}
        </div>
        ${le}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${se}
        </div>
        ${ce}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let N="";o.loading&&!o.data?N=qe(Math.ceil(l/7)):o.error?N=`<div class="rpc-history-error">${b(o.error)}</div>`:o.data&&(N=Ie(o.data,l,i,e.language,t.hasDirtDensity),o.data.length<l&&(N+=`<div class="rpc-history-partial">Showing ${o.data.length} of ${l} days \u2014 full history builds over time</div>`));let J="";if(t.hasProblemZone){let W=e.states[`sensor.${a}_problem_zone`],R=e.states[`sensor.${a}_stuck_count_30d`];if(W&&W.state!=="unknown"&&W.state!=="unavailable"){let z=R?parseInt(R.state,10):0;z>0&&(J=`<div class="rpc-problem-zone">\u26A0 ${b(W.state)} \u2014 stuck ${z}\xD7 in 30 days</div>`)}}let ie="";if(o.openDay){let R=new Date(o.openDay+"T00:00:00").toLocaleDateString(e.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),z=o.dayMissions,D=o.openDaySummary,F="";if(z===null)F="";else if(D&&D.total===0)F='<div class="rpc-day-empty">No missions this day</div>';else if(z.length>0)F=z.map((x,q)=>{let I=x.result==="completed"||x.result==="stuck_and_resumed",te=I?"\u2713":"\u2717",le=I?"rpc-day-ok":"rpc-day-err",ce=new Date(x.started_at).toLocaleTimeString(e.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),me=x.area_sqft!==null?Ue(x.area_sqft,c):"\u2014",pe=x.zones?.map(B=>b(B)).join(" \xB7 ")??"",re=n.show_dirt_events&&x.dirt_events!=null&&x.dirt_events>0?`${x.dirt_events} dirt event${x.dirt_events!==1?"s":""}`:"",se=[pe,re].filter(Boolean).join(" \xB7 "),Q=x.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",L="";if(x.wifi_signal&&x.wifi_signal.length>0){let B=x.wifi_signal.length===5,g=Oe(x.wifi_signal),k=We(g,Math.min(...g));if(B){let $=Be(x.wifi_signal);$!==null&&(L=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${$}% average during mission"><span aria-hidden="true">\u{1F4F6}</span>${k}<span>${$}% avg</span></div>`)}else{let $=Math.min(...g);L=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${$}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${k}<span>${$}% min</span></div>`}}let Y="";if(_&&q===z.length-1&&u.length>0){let B=u.map(k=>{let $=m[k],T=$?oe[$]??"":"";return`<span class="rpc-trav-room">${T?T+"\xA0":""}${b(k)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),g=f?`<div class="rpc-mission-dest-popover">\u2192 Final: ${b(f)}</div>`:"";Y=`<div class="rpc-traversal-row">${B}</div>${g}`}let j="";x.room_coverage&&Object.keys(x.room_coverage).length>0&&(j=`<div class="rpc-room-coverage">${Object.entries(x.room_coverage).map(([g,k])=>{let $=Math.round(k*100);return`<span class="${$>=80?"rpc-cov-green":$>=60?"rpc-cov-amber":"rpc-cov-red"}">${b(g)} ${$}%</span>`}).join(" \xB7 ")}</div>`);let M="";return x.alignment_confidence!=null&&x.alignment_confidence<.85&&(M=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(x.alignment_confidence*100)}%)</div>`),`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${le}">${te}</span>
            <span class="rpc-day-time">${ce}</span>
            <span class="rpc-day-dur">${x.duration_min} min</span>
            <span class="rpc-day-area">${me}</span>
            ${Q}
            ${se?`<div class="rpc-day-zones">${se}</div>`:""}
            ${L}
            ${Y}
            ${j}
            ${M}
          </div>`}).join("");else if(D&&D.total>0){let x=D.area_sqft!==null?Ue(D.area_sqft,c):null;F=`
        <div class="rpc-day-aggregate">
          <div>${D.total} mission${D.total>1?"s":""} \xB7 ${b(D.result)}
            ${x?` \xB7 ${x} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let O=D?.total??0;ie=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${b(R)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${O>0&&z&&z.length>0?`<div class="rpc-day-count">${O} mission${O>1?"s":""}</div>`:""}
        ${F}
      </div>
    `}let ee="";if(n.show_lifetime!==!1){let W=e.states[`sensor.${a}_lifetime_missions`],R=e.states[`sensor.${a}_cleaning_analytics_30d`],z=W?parseInt(W.state,10):NaN,D=(()=>{let x=R?.attributes?.time_h;return typeof x=="number"?x:NaN})(),F=R?parseFloat(R.state):NaN;if(!isNaN(z)||!isNaN(D)||!isNaN(F)){let x=o.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(z)?"":`<span>${z.toLocaleString()} missions</span>`}
          ${isNaN(F)?"":`<span>${F.toLocaleString()} m\xB2</span>`}
          ${isNaN(D)?"":`<span>${D.toLocaleString()} h (30 d)</span>`}
        </div>`:"";ee=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${o.lifetimeExpanded}">
          Stats ${o.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${x}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${l} DAYS</div>
      ${A}
      ${V}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&t.hasCoverageImage?Z:N}
      </div>
      ${J}
      ${ie}
      ${ee}
    </div>
  `}function Ye(e,n,t,r,o){if((n.entities?.length??0)<2||!r)return"";let s=n.area_unit??"auto",a=s==="m2"||s==="auto"&&o;function l(m){return m==null?"":a?`${Math.round(m*.0929)} m\xB2`:`${Math.round(m)} ft\xB2`}function i(m){return m>=90?"rpc-cov-green":m>=70?"rpc-cov-amber":"rpc-cov-red"}let c=r.robots.map(m=>{let u=Math.round(m.completion_pct),f=l(m.area_sqft),y=[`${m.missions} mission${m.missions!==1?"s":""}`,f].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${b(m.name)}</span>
        <span class="${i(u)}">${u}%</span>
        <span class="rpc-household-meta">${y}</span>
      </div>`}).join(""),p="";r.floors&&r.floors.length>1&&(p=`<div class="rpc-household-floors">${r.floors.map(u=>{let f=l(u.area_sqft),y=[`${u.missions} mission${u.missions!==1?"s":""}`,f].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${b(u.label)}</span>
          <span class="rpc-household-meta">${y}</span>
        </div>`}).join("")}</div>`);let d=r.total,h=Math.round(d.completion_pct),v=l(d.area_sqft),S=[`${d.missions} mission${d.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${r.period_days} DAYS</div>
      ${c}
      ${p}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${i(h)}">${h}%</span>
        <span class="rpc-household-meta">${S}</span>
      </div>
    </div>`}function ne(e,n){return e.states[n]?.state??"unavailable"}function Ge(e,n,t){return n==="m2"||n==="auto"&&t?`${Math.round(e*.0929)} m\xB2`:`${e} ft\xB2`}function bt(e,n){if(!e)return null;for(let t=e.length-1;t>=0;t--){let r=e[t];if(r.missions&&r.missions.length>0)for(let o=r.missions.length-1;o>=0;o--){let s=r.missions[o];if(s.result==="completed")return K(s.started_at,n)}else if(r.completed>0)return K(r.date+"T12:00:00Z",n)}return null}function ft(e){let n=["th","st","nd","rd"],t=e%100;return e+(n[(t-20)%10]??n[t]??n[0])}function Ke(e){let{hass:n,config:t,caps:r,robotName:o,loadingAction:s,todayMissionCount:a,roomPickerOpen:l,selectedRoomCount:i}=e,c=t.entity,p=ne(n,c),d=n.states[c]?.attributes??{},h=n.config?.unit_system?.length==="m",v=t.area_unit??"auto",S=p==="unavailable",m=s!==null,u=o,f=`sensor.${u}_last_error_code`,y=`sensor.${u}_last_error_zone`,_=`sensor.${u}_mission_recharge_time`,w=`sensor.${u}_average_mission_time`,C=`sensor.${u}_area_cleaned_today`,E=d.mission_elapsed_min??null,H=d.mission_area_sqft??null,A=parseFloat(ne(n,w)),P=isNaN(A)||A<=0?45:A,V=r.isMop,Z=V?"\u{1F9F9}":"\u{1F916}",N=b(d.friendly_name??c),J=n.states[`sensor.${u}_phase`]?.state??"",ee=(n.states[`binary_sensor.${u}_mission_active`]?.state??"")==="on",W=r.hasMissionActive,R=n.states[`sensor.${u}_mission_expire_time`]?.state??"",z=R&&R!=="unavailable"&&R!=="unknown"?new Date(R):null,D=!!z&&!isNaN(z.getTime())&&z>new Date,F=D?Math.max(1,Math.round((z.getTime()-Date.now())/6e4)):null,O=!1;if(W)O=p==="docked"&&ee;else{let g=ne(n,_);O=p==="docked"&&(g!=="unavailable"&&g!=="unknown"&&R!=="unavailable"&&R!=="unknown")&&D}let x="";if(O&&r.hasMissionProgressSensor){let k=n.states[`sensor.${u}_mission_progress`]?.attributes?.recharge_min;typeof k=="number"&&(x=`<div class="rpc-recharge-line">\u26A1 Recharging \xB7 ${Math.round(k)} min</div>`)}let q="",I="",te="";if(J==="evac")q="\u2B06",I="Emptying bin";else if(O)q="\u26A1",I=F!==null?`Recharging \u2014 resuming in ~${F} min`:"Recharging \u2014 mission continues";else switch(p){case"cleaning":q="\u25CF",I=V?"Mopping":"Cleaning";break;case"paused":q="\u23F8",I="Paused";break;case"returning":q="\u21A9",I="Returning to dock";break;case"docked":q="\u2713",I="Docked";break;case"idle":q="\u25CB",I="Idle";break;case"error":q="\u26A0",I="Error",te="rpc-error-state";break;case"unavailable":q="\u2014",I="Unavailable";break}let le="";if(p==="error"){let g=n.states[f];if(g&&g.state!=="0"&&g.state!==""&&g.state!=="unavailable"){let k=b(g.attributes.description??"Unknown error"),$=b(g.attributes.action??""),T=ne(n,y),G=T&&T!=="unknown"&&T!=="unavailable";I=`Error ${b(g.state)} \u2014 ${k}`,le=`
        ${$?`<div class="rpc-error-action">${$}</div>`:""}
        ${G?`<div class="rpc-error-zone">Zone: ${b(T)}</div>`:""}
      `}else I="Robot error \u2014 check the iRobot app"}let ce="";if((W?ee:p==="cleaning"||O)&&r.hasArea){let g=parseFloat(ne(n,C));if(!isNaN(g)&&g>0){let k=Ge(g,v,h),$=a!==null?a+1:null,T=$!==null&&$>1?` \xB7 ${b(ft($))} mission`:"";ce=`<div class="rpc-area-today">${k} already today${T}</div>`}}let pe="";p==="cleaning"&&E!==null&&(pe=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min(E/P*100,95)}%"></div></div>`);let re="";if(p==="cleaning")if(r.hasMissionProgressSensor){let g=n.states[`sensor.${u}_mission_progress`],k=g?.attributes?.current_room,$=g&&g.state!=="unavailable"&&g.state!=="unknown"?parseFloat(g.state):NaN;if(k||!isNaN($)){let T=[];k&&T.push(b(k)),isNaN($)||T.push(`${Math.round($)}%`),re=`<div class="rpc-spatial-line">${T.join(" \xB7 ")}</div>`}}else{let g=d.mission_destination;g&&(re=`<div class="rpc-spatial-line">\u2192 Targeting: ${b(g)}</div>`)}let se="";if(p==="cleaning"){let g=[];if(E!==null){let k=Math.max(0,Math.round(P-E));g.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${k} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(r.hasArea&&H!==null){g.push(`<div class="rpc-metric"><span class="rpc-metric-val">${Ge(H,v,h)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let k=parseFloat(ne(n,`sensor.${u}_cleaning_analytics_30d`)),$=parseFloat(ne(n,`sensor.${u}_missions_last_30d`)),T=!isNaN(k)&&!isNaN($)&&$>=5?k/$:NaN;if(!isNaN(T)&&T>0){let G=Math.round((H-T)/T*100),he=G>=0?"\u25B2":"\u25BC",rt=G>=0?"rpc-delta-up":"rpc-delta-down";g.push(`<div class="rpc-metric"><span class="rpc-metric-val ${rt}">${he} ${Math.abs(G)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}g.length&&(se=`<div class="rpc-metrics-row">${g.join("")}</div>`)}let Q="";if(p==="docked"&&!O){let g=bt(e.missionData,n.language);if(g)Q=`<div class="rpc-docked-since">Last cleaned: ${g}</div>`;else{let k=n.states[c]?.last_changed;k&&(Q=`<div class="rpc-docked-since">Last mission: ${K(k,n.language)}</div>`)}}let L="";r.hasDemandBlocked&&n.states[`binary_sensor.${u}_demand_clean_blocked`]?.state==="on"&&(L='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let Y="";if(r.hasCleanedRooms&&(p==="docked"||p==="idle")&&!O){let g=d.last_cleaned_rooms,k=d.region_icons;g&&g.length>0&&(Y=`<div class="rpc-cleaned-rooms">${g.map(T=>{let G=k?.[T],he=G?oe[G]??"":"";return`<span class="rpc-cleaned-chip">${he?he+"\xA0":""}${b(T)}</span>`}).join("")}</div>`)}let ae='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',j=(g,k,$)=>{let T=s===g;return`<button class="rpc-btn${T?" rpc-btn-loading":""}"
      data-action="${g}"
      ${S||m?"disabled":""}
      aria-label="${k}">
      ${T?ae:$}
    </button>`},M="",B=r.hasDemandBlocked&&n.states[`binary_sensor.${u}_demand_clean_blocked`]?.state==="on";return p==="cleaning"||J==="evac"?M=j("pause","Pause","\u23F8 Pause")+j("return_home","Return home","\u{1F3E0} Return home"):p==="paused"?M=j("resume","Resume","\u25B6 Resume")+j("return_home","Return home","\u{1F3E0} Return home")+j("stop","Stop","\u23F9 Stop"):p==="error"?M=j("return_home","Return home","\u{1F3E0} Return home")+j("retry","Retry","\u{1F504} Retry"):O?M=j("return_home","Cancel mission","\u2715 Cancel mission"):p!=="returning"&&!S&&(i>0?M=j("clean-selected","Start selected rooms",`\u25B6 Start ${i} selected room${i!==1?"s":""}`):(M=j("start","Start full clean",B?"\u25B6 Start anyway":"\u25B6 Start full clean"),t.mode!=="companion"&&r.hasZones&&(M+=`<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${l}">
          \u{1F5FA} Rooms\u2026
        </button>`))),`
    <div class="rpc-header${te?" "+te:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${Z}</span>
        <span class="rpc-robot-name">${N}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${p}">${q}</span>
        <span class="rpc-state-label">${I}</span>
      </div>
      ${ce}
      ${le}
      ${pe}
      ${re}
      ${x}
      ${se}
      ${Q}
      ${L}
      ${Y}
      ${M?`<div class="rpc-actions">${M}</div>`:""}
    </div>
  `}function Je(e,n){let t=[];return e.mode!=="companion"&&n.hasCoverageImage&&t.push({id:"map",icon:"\u{1F5FA}",label:"Map"}),t.push({id:"history",icon:"\u{1F4C5}",label:"History"}),t.push({id:"health",icon:"\u2764",label:"Health"}),t.push({id:"settings",icon:"\u2699",label:""}),t}function ke(e,n){return e.default_tab?e.default_tab:e.mode!=="companion"&&n.hasCoverageImage?"map":"history"}function Qe(e,n,t){let r=t;if(n.hasRobotHealthScore){let o=e.states[`sensor.${r}_robot_health_score`];if(o&&o.state!=="unknown"&&o.state!=="unavailable"){let s=parseFloat(o.state);if(!isNaN(s)&&s<60)return!0}}if(n.hasMaintenanceCalendar){let o=[`sensor.${r}_wheel_last_cleaned`,`sensor.${r}_contact_last_cleaned`,`sensor.${r}_bin_last_cleaned`],s=Date.now();for(let a of o){let l=e.states[a];if(!l||l.state==="unavailable"||l.state==="unknown")continue;let i=new Date(l.state).getTime();if(!isNaN(i)&&(s-i)/864e5>90)return!0}}return!!$e(e,n,t,"health")}function Xe(e,n,t){return $e(e,n,t,"history")}function et(e,n,t={}){return`
    <div class="rpc-tab-bar" role="tablist">
      ${e.map(r=>`
        <button class="rpc-tab-btn${r.id===n?" rpc-tab-btn--active":""}"
                role="tab" aria-selected="${r.id===n}"
                data-tab="${r.id}">
          <span class="rpc-tab-icon">${r.icon}</span>${r.label?`<span class="rpc-tab-label">${r.label}</span>`:""}
          ${t[r.id]?'<span class="rpc-tab-badge"></span>':""}
        </button>
      `).join("")}
    </div>
  `}var tt=`
  :host {
    display: block;
    font-family: inherit;
    /* Semantic colours \u2014 cascade from HA theme when available, fall back to
       accessible defaults that match the standard HA colour palette.
       --state-active-color / --warning-color / --error-color are defined by
       every HA theme including Bubble Card themes and the default theme.      */
    /* B1 fix (v2.0): fixed constant, not var(--state-active-color, ...).
       Themes like Casa5/Bubble Card redefine --state-active-color in ways
       that can render this token amber-ish, breaking the green/amber/red
       health-bar invariant. Health colour semantics must never depend on
       a theme variable that wasn't designed for this purpose. */
    --rpc-green:      #4ade80;
    --rpc-amber:      var(--warning-color,         #d97706);
    --rpc-red:        var(--error-color,           #db4437);
    --rpc-blue:       var(--primary-color,         #2563eb);
    --rpc-grey-light: var(--divider-color,         #e5e7eb);
    --rpc-grey-mid:   var(--disabled-text-color,   #9ca3af);
    /* Heatmap empty-cell colour follows the card's secondary surface */
    --rpc-cell-empty: var(--secondary-background-color, #e5e7eb);
    --rpc-card-padding:   16px;
    --rpc-bar-height:     6px;
    --rpc-bar-row-height: 44px;
    --rpc-bar-radius:     3px;
    --rpc-dot-size:       8px;
    --rpc-cell-size:      20px;
    --rpc-cell-touch:     24px;
    --rpc-cell-gap:       3px;
  }

  .rpc-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    padding: var(--rpc-card-padding);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  /* \u2500\u2500\u2500 Zones \u2500\u2500\u2500 */
  .rpc-zone { padding: 12px 0; }
  .rpc-zone + .rpc-zone { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }

  .rpc-zone-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 8px;
  }

  /* \u2500\u2500\u2500 v2.0 Persistent header (was Zone 1 \u2014 Status) \u2500\u2500\u2500 */
  .rpc-header { padding: 0 0 12px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08)); margin-bottom: 4px; }
  .rpc-robot-identity { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-robot-icon { font-size: 1.1rem; }
  .rpc-robot-name { font-size: 0.9rem; font-weight: 600; color: var(--secondary-text-color, #9ca3af); }

  .rpc-state-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .rpc-state-dot { font-size: 1.1rem; line-height: 1; }
  .rpc-state-dot.rpc-state-cleaning {
    color: var(--rpc-green);
    animation: rpc-blink 1.4s ease-in-out infinite;
  }
  .rpc-state-dot.rpc-state-error     { color: var(--rpc-red); }
  .rpc-state-dot.rpc-state-docked    { color: var(--rpc-green); }
  .rpc-state-dot.rpc-state-returning { color: var(--rpc-amber); }
  @keyframes rpc-blink { 0%,100%{opacity:1} 50%{opacity:.4} }

  .rpc-state-label { font-size: 1rem; font-weight: 500; }
  .rpc-error-state { border-left: 3px solid var(--rpc-red); padding-left: 10px; }
  .rpc-error-action, .rpc-error-zone {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }

  /* Wave A3 \u2014 area-today */
  .rpc-area-today {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin: 2px 0 4px 28px;
  }

  /* Progress bar */
  .rpc-progress-track {
    height: 4px; background: var(--rpc-grey-light);
    border-radius: 2px; margin: 8px 0; overflow: hidden;
  }
  .rpc-progress-fill {
    height: 100%; background: var(--rpc-green);
    border-radius: 2px; transition: width 1s ease;
  }

  /* Metrics */
  .rpc-metrics-row { display: flex; gap: 20px; margin: 8px 0; }
  .rpc-metric { display: flex; flex-direction: column; gap: 2px; }
  .rpc-metric-val { font-size: 1.15rem; font-weight: 600; }
  .rpc-metric-lbl { font-size: 0.7rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; }
  .rpc-delta-up   { color: var(--rpc-green); }
  .rpc-delta-down { color: var(--rpc-amber); }
  .rpc-robot-selector { margin-bottom: 10px; }
  .rpc-robot-select { width: 100%; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer; }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-demand-blocked { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 4px; }

  /* Action buttons */
  .rpc-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .rpc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; border: none;
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s; background: var(--primary-color, #2563eb); color: #fff;
    min-height: 36px; font-family: inherit;
  }
  .rpc-btn:hover:not(:disabled) { opacity: 0.85; }
  .rpc-btn:disabled, .rpc-btn-disabled { opacity: 0.45; cursor: default; }
  .rpc-btn-loading { opacity: 0.7; cursor: wait; }
  .rpc-btn-primary { width: 100%; padding: 10px; font-size: 0.9rem; }
  .rpc-btn-secondary {
    background: transparent; border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    color: var(--primary-text-color); width: 100%; margin-top: 10px;
  }
  .rpc-btn-text {
    background: none; border: none; color: var(--secondary-text-color);
    font-size: 0.8rem; cursor: pointer; padding: 4px 6px; font-family: inherit;
    margin-top: 4px; align-self: flex-end;
  }
  .rpc-btn-text:hover { color: var(--primary-text-color); }
  .rpc-send-error { font-size: 0.78rem; color: var(--rpc-red); margin-top: 6px; }

  /* Spinner */
  .rpc-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    animation: rpc-spin 0.8s linear infinite;
  }
  .rpc-spinner-sm { width: 12px; height: 12px; }
  @keyframes rpc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* \u2500\u2500\u2500 Zone 2 \u2014 Room Selector \u2500\u2500\u2500 */
  .rpc-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
  .rpc-room-chip {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--primary-color, #2563eb);
    background: transparent; color: var(--primary-color, #2563eb);
    font-size: 0.82rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-room-chip--selected { background: var(--primary-color, #2563eb); color: #fff; }
  .rpc-selected-count { font-size: 0.78rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-passes-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-passes-label { font-size: 0.8rem; color: var(--secondary-text-color); margin-right: 4px; }
  .rpc-pass-chip {
    padding: 3px 10px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--primary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit; transition: background 0.12s;
  }
  .rpc-pass-chip--selected { background: var(--secondary-background-color, #f3f4f6); font-weight: 600; }
  .rpc-room-actions { display: flex; flex-direction: column; gap: 4px; }

  /* \u2500\u2500\u2500 Zone 3 \u2014 Health \u2500\u2500\u2500 */
  .rpc-bar-row {
    display: flex; align-items: center; min-height: var(--rpc-bar-row-height);
    gap: 8px; cursor: pointer; border-radius: 6px; padding: 0 2px;
    transition: background 0.12s;
  }
  .rpc-bar-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-bar-label { font-size: 0.82rem; color: var(--secondary-text-color); min-width: 65px; flex-shrink: 0; }
  .rpc-bar-track { flex: 1; height: var(--rpc-bar-height); background: var(--rpc-grey-light); border-radius: var(--rpc-bar-radius); overflow: hidden; }
  .rpc-bar-fill  { height: 100%; border-radius: var(--rpc-bar-radius); transition: width 0.4s ease; }
  .rpc-bar-pct   { font-size: 0.8rem; font-weight: 600; min-width: 36px; text-align: right; flex-shrink: 0; }
  .rpc-bar-hours { font-size: 0.78rem; color: var(--secondary-text-color); min-width: 30px; flex-shrink: 0; }
  .rpc-bar-arrow { font-size: 0.78rem; font-weight: 600; flex-shrink: 0; }
  .rpc-bar-cleanbase-state { font-size: 0.82rem; color: var(--secondary-text-color); flex: 1; }

  /* Wear legend */
  .rpc-wear-legend {
    display: flex; flex-direction: column; gap: 3px;
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 8px 10px; margin: 8px 0;
    font-size: 0.78rem; color: var(--secondary-text-color);
  }
  .rpc-wear-legend-title {
    font-weight: 600; color: var(--primary-text-color);
    margin-bottom: 2px; font-size: 0.8rem;
  }

  /* Wave A4 \u2014 Mop config row */
  .rpc-health-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 6px 0; }
  .rpc-mop-config { font-size: 0.82rem; color: var(--secondary-text-color); padding: 4px 2px; }

  /* F3b \u2014 compact divider + CONTROLS label when settings relocate to Status zone */
  .rpc-settings-divider--compact { margin: 8px 0 4px; }
  .rpc-controls-label { margin-top: 4px; margin-bottom: 4px; }

  /* v1.3 \u2014 static bar rows (no popover / click interaction) */
  .rpc-bar-row--static { cursor: default; }
  .rpc-bar-row--static:hover { background: transparent; }

  /* v2.0 C1-HEALTH \u2014 robot health score */
  .rpc-health-score {
    display: flex; align-items: baseline; gap: 10px;
    padding: 8px 2px 4px;
  }
  .rpc-health-score--calibrating { align-items: center; }
  .rpc-health-score-label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
  }
  .rpc-health-score-value { font-size: 1.6rem; font-weight: 700; line-height: 1; }
  .rpc-health-score-band  { font-size: 0.75rem; font-weight: 600; }
  .rpc-health-score-calibrating {
    font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); font-style: italic;
  }
  .rpc-health-details-toggle {
    background: none; border: none; cursor: pointer; padding: 2px 2px 8px;
    font-size: 0.78rem; color: var(--primary-color, #2563eb);
    font-family: inherit;
  }

  /* v2.0 C5-ANOMALY \u2014 mission anomaly banner */
  .rpc-anomaly-banner {
    background: color-mix(in srgb, var(--rpc-amber) 12%, transparent);
    border-left: 3px solid var(--rpc-amber);
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 0.82rem;
    margin-bottom: 6px;
  }

  /* v2.0 C2-MAINT \u2014 maintenance calendar */
  .rpc-maint-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 8px 0 6px; }
  .rpc-maint-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 4px;
  }
  .rpc-maint-row {
    display: flex; align-items: center; justify-content: space-between;
    min-height: 36px; cursor: pointer; padding: 2px 2px;
  }
  .rpc-maint-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-maint-label { font-size: 0.82rem; }
  .rpc-maint-val   { font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); }
  .rpc-maint-service {
    font-family: monospace; font-size: 0.78rem; background: var(--secondary-background-color, rgba(0,0,0,.05));
    padding: 4px 6px; border-radius: 4px; margin-top: 2px; word-break: break-all;
  }

  /* v2.0 \u2014 \u2699 tab maintenance service links */
  .rpc-maint-link-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 2px; font-size: 0.8rem;
  }
  .rpc-maint-link-label   { color: var(--primary-text-color); }
  .rpc-maint-link-service {
    font-family: monospace; font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
  }
  .rpc-maint-link-hint {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    margin-top: 4px; font-style: italic;
  }

  /* v1.3 \u2014 coverage "Building history\u2026" skeleton text */
  .rpc-coverage-building {
    flex: 1; font-size: 0.8rem; color: var(--secondary-text-color);
    font-style: italic;
  }

  /* v1.3 \u2014 battery health group separator */
  .rpc-health-battery-sep { height: 1px; background: var(--divider-color, rgba(0,0,0,.06)); margin: 4px 0; }

  /* v1.3 \u2014 retention popover body + sub-line */
  .rpc-popover-body { padding: 4px 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; }
  .rpc-popover-sub  { font-size: 0.78rem; color: var(--secondary-text-color); }

  /* v1.3 \u2014 battery EOL lines inside retention popover */
  .rpc-retention-eol      { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-retention-eol--warn { color: var(--rpc-red); font-weight: 500; }

  /* \u2500\u2500\u2500 Popovers \u2500\u2500\u2500 */
  .rpc-popover {
    background: var(--secondary-background-color, #f9fafb);
    border: 1px solid var(--divider-color, rgba(0,0,0,.1));
    border-radius: 8px; padding: 12px; margin: 4px 0 6px;
    animation: rpc-expand 0.15s ease-out;
  }
  @keyframes rpc-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .rpc-popover-header {
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; font-size: 0.88rem; margin-bottom: 8px;
  }
  .rpc-popover-close {
    background: none; border: none; font-size: 1.1rem; cursor: pointer;
    color: var(--secondary-text-color); line-height: 1; padding: 0 4px; font-family: inherit;
  }
  .rpc-popover-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.1)); margin: 8px -12px; }
  .rpc-popover-row {
    display: flex; justify-content: space-between;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 6px;
  }
  .rpc-popover-row span:last-child { color: var(--primary-text-color); font-weight: 500; }
  .rpc-popover-bar-track { height: 8px; background: var(--rpc-grey-light); border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .rpc-popover-bar-fill  { height: 100%; border-radius: 4px; }

  /* Day popover */
  .rpc-day-count   { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-day-empty   { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-day-mission { display: flex; align-items: baseline; gap: 8px; font-size: 0.82rem; margin-bottom: 6px; flex-wrap: wrap; }
  .rpc-day-icon  { font-weight: 700; flex-shrink: 0; }
  .rpc-day-ok    { color: var(--rpc-green); }
  .rpc-day-err   { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-day-aggregate { font-size: 0.82rem; }
  .rpc-day-no-detail { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }
  /* F1: demand initiator badge \u2014 robot cleaned because floor was dirty */
  .rpc-initiator-badge {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--rpc-blue); background: color-mix(in srgb, var(--rpc-blue) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--rpc-blue) 25%, transparent);
    border-radius: 4px; padding: 1px 5px; vertical-align: middle; white-space: nowrap;
    flex-shrink: 0;
  }
  /* v1.3 \u2014 WiFi sparkline row in day popover */
  .rpc-day-wifi {
    width: 100%; padding-left: 20px; display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px;
  }

  /* \u2500\u2500\u2500 Zone 4 \u2014 Schedule \u2500\u2500\u2500 */
  .rpc-schedule-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .rpc-next-clean { display: flex; flex-direction: column; gap: 2px; }
  .rpc-schedule-label { font-size: 0.75rem; color: var(--secondary-text-color); }
  .rpc-schedule-time  { font-size: 0.9rem; font-weight: 600; }
  .rpc-hold-badge {
    padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 500;
    border: none; cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 4px;
    transition: opacity 0.15s; white-space: nowrap;
  }
  .rpc-hold-badge:hover { opacity: 0.8; }
  .rpc-badge-green { background: rgba(45,156,79,.15);  color: var(--rpc-green); }
  .rpc-badge-amber { background: rgba(217,119,6,.15);  color: var(--rpc-amber); }
  .rpc-badge-blue  { background: rgba(37,99,235,.15);  color: var(--rpc-blue); }
  .rpc-hold-tooltip {
    font-size: 0.78rem; color: var(--secondary-text-color);
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 6px 10px; margin-top: 4px;
    animation: rpc-expand 0.15s ease-out;
  }
  .rpc-presence-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .rpc-presence-dot { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; }
  .rpc-dot { display: inline-block; width: var(--rpc-dot-size); height: var(--rpc-dot-size); border-radius: 50%; flex-shrink: 0; }
  .rpc-dot-green { background: var(--rpc-green); }
  .rpc-dot-amber { background: var(--rpc-amber); }
  .rpc-presence-label { color: var(--secondary-text-color); }

  /* \u2500\u2500\u2500 Zone 5 \u2014 Alerts \u2500\u2500\u2500 */
  .rpc-zone5 { animation: rpc-expand 0.2s ease-out; }
  .rpc-alert-box {
    display: flex; gap: 10px; align-items: flex-start;
    background: rgba(220,38,38,.07); border: 1px solid rgba(220,38,38,.2);
    border-radius: 8px; padding: 10px 12px;
  }
  .rpc-alert-icon    { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
  .rpc-alert-text    { font-size: 0.85rem; font-weight: 500; }
  .rpc-alert-sub     { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* \u2500\u2500\u2500 Wave B/C additions \u2500\u2500\u2500 */

  /* B1 \u2014 Presence analytics */
  .rpc-schedule-times { display: flex; flex-direction: column; gap: 4px; }
  .rpc-next-clean--likely .rpc-schedule-time { color: var(--secondary-text-color); }
  .rpc-schedule-time--approx { font-style: italic; }
  .rpc-presence-analytics {
    font-size: 0.78rem; color: var(--secondary-text-color);
    margin-top: 6px; padding: 4px 2px;
  }

  /* B3 \u2014 Settings panel */
  .rpc-settings-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-settings-row {
    display: flex; align-items: center; gap: 6px; width: 100%;
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.8rem; color: var(--secondary-text-color);
    padding: 8px 2px; text-align: left;
  }
  .rpc-settings-row:hover { color: var(--primary-text-color); }
  .rpc-settings-icon { font-size: 0.9rem; }
  .rpc-settings-label { flex: 1; }
  .rpc-settings-arrow { font-size: 0.7rem; }

  .rpc-settings-panel {
    display: flex; flex-wrap: wrap; gap: 6px 16px;
    padding: 8px 2px 4px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-setting-item { display: flex; align-items: center; gap: 6px; }
  .rpc-setting-label { font-size: 0.8rem; color: var(--secondary-text-color); }
  .rpc-setting-toggle {
    background: none; border: none; cursor: pointer; font-size: 0.9rem;
    color: var(--secondary-text-color); font-family: inherit; padding: 2px 4px;
    border-radius: 4px; transition: color 0.12s;
  }
  .rpc-setting-toggle:hover { color: var(--primary-text-color); }
  .rpc-setting-on { color: var(--rpc-green) !important; }
  .rpc-setting-cycle {
    background: var(--secondary-background-color, #f3f4f6);
    border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    border-radius: 6px; padding: 3px 8px; font-size: 0.78rem;
    cursor: pointer; font-family: inherit; color: var(--primary-text-color);
  }
  .rpc-setting-cycle:hover { opacity: 0.8; }

  /* C1 \u2014 Lifetime stats */
  .rpc-lifetime-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-lifetime-toggle {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.78rem; color: var(--secondary-text-color);
    padding: 8px 2px; width: 100%; text-align: left;
  }
  .rpc-lifetime-toggle:hover { color: var(--primary-text-color); }
  .rpc-lifetime-stats {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--secondary-text-color);
    padding: 2px 2px 6px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-lifetime-arrow { color: var(--secondary-text-color); }
  .rpc-lifetime-stats span { white-space: nowrap; }
  .rpc-history-summary {
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px;
  }
  .rpc-summary-sep { margin: 0 5px; opacity: 0.5; }
  /* v1.3 \u2014 speed trend colour tokens in history summary bar */
  .rpc-trend-declining { color: var(--rpc-amber); font-weight: 500; }
  .rpc-trend-improving { color: var(--rpc-green); font-weight: 500; }
  /* v2.0: heatmap promoted to full-width Map/History tabs \u2014 SVG now scales
   * responsively instead of rendering at fixed natural size. The svg's own
   * width/height attributes (200\xD7NNN at the current 24px CELL constant in
   * heatmap.ts) become the intrinsic aspect-ratio source for the viewBox;
   * CSS width/height here override layout sizing without touching the
   * coordinate system inside the SVG, so heatmap.ts and its fixed-geometry
   * tests are unaffected by this purely presentational change.
   * clamp(min, container-driven, max): min \u2248 7 cols \xD7 8px cells (smallest
   * touch-safe size per the v2.0 plan); max = current 200px / 24px cells
   * (the pre-v2.0 fixed size) so wide desktop columns don't render an
   * oversized calendar. */
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg {
    display: block;
    width: clamp(88px, 100%, 200px);
    height: auto;
  }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }

  /* \u2500\u2500 v1.5 \u2014 History tab toggle (Calendar / Coverage) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-history-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
  .rpc-tab {
    padding: 3px 12px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--secondary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-tab.active { background: var(--rpc-blue); color: #fff; border-color: transparent; }

  /* \u2500\u2500 v1.5 \u2014 Coverage heatmap panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-coverage-panel { margin-top: 8px; }
  .rpc-coverage-image-wrap { position: relative; }
  .rpc-coverage-img { width: 100%; display: block; border-radius: 8px; }
  .rpc-hazard-pin {
    position: absolute; transform: translate(-50%, -100%);
    cursor: pointer; font-size: 1rem; line-height: 1;
    touch-action: manipulation;
  }
  /* Source-specific opacity: stuck hotspots fullweight, others slightly muted */
  .rpc-pin-robot_learned { opacity: 0.85; }
  .rpc-pin-keepout        { opacity: 0.80; }
  .rpc-coverage-legend {
    display: flex; flex-wrap: wrap; gap: 10px;
    font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px;
  }
  .rpc-coverage-updated { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-coverage-note    { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; font-style: italic; }

  /* \u2500\u2500 v2.0 C7-ROOM-BOUNDS \u2014 room polygon overlay + tap-to-select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-room-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; /* polygons opt back in individually below */
  }
  .rpc-room-poly {
    fill: var(--primary-color, #2563eb); fill-opacity: 0.08;
    stroke: var(--primary-color, #2563eb); stroke-opacity: 0.35; stroke-width: 0.4;
    cursor: pointer; pointer-events: auto;
  }
  .rpc-room-poly:hover       { fill-opacity: 0.16; stroke-opacity: 0.6; }
  .rpc-room-poly--selected   { fill-opacity: 0.28; stroke-opacity: 0.9; stroke-width: 0.6; }
  .rpc-room-label {
    position: absolute; transform: translate(-50%, -50%);
    font-size: 0.7rem; padding: 1px 5px; border-radius: 8px;
    background: var(--card-background-color, #fff); color: var(--primary-text-color);
    box-shadow: 0 1px 2px rgba(0,0,0,.15);
    cursor: pointer; white-space: nowrap; pointer-events: auto;
  }
  .rpc-room-label--selected {
    background: var(--primary-color, #2563eb); color: #fff;
  }

  /* \u2500\u2500 v1.5 \u2014 F8 room coverage chips in day popover \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-room-coverage {
    width: 100%; padding-left: 20px;
    display: flex; flex-wrap: wrap; gap: 5px;
    font-size: 0.75rem; margin-top: 3px;
  }
  .rpc-cov-green { color: var(--rpc-green); }
  .rpc-cov-amber { color: var(--rpc-amber); }
  .rpc-cov-red   { color: var(--rpc-red);   }
  .rpc-alignment-note {
    width: 100%; padding-left: 20px;
    font-size: 0.70rem; color: var(--secondary-text-color); margin-top: 2px;
  }

  /* \u2500\u2500 v1.6 \u2014 Status zone: destination + cleaned rooms + demand \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-mission-dest   { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-cleaned-rooms  { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; font-size: 0.80rem; }
  .rpc-cleaned-chip   { background: var(--secondary-background-color, #f3f4f6); border-radius: 10px; padding: 2px 8px; }
  .rpc-demand-blocked { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 6px; padding-left: 2px; }

  /* \u2500\u2500 v2.0 \u2014 header: unified spatial line (F11 + C3-PROGRESS merge), recharge line \u2500\u2500 */
  .rpc-spatial-line  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-recharge-line { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 4px; padding-left: 2px; }

  /* \u2500\u2500 v2.0 \u2014 tab bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-tab-bar {
    display: flex; gap: 2px; margin: 6px 0 4px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
  }
  .rpc-tab-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    background: none; border: none; cursor: pointer; font-family: inherit;
    padding: 8px 4px; font-size: 0.78rem; color: var(--secondary-text-color, #9ca3af);
    position: relative; border-bottom: 2px solid transparent;
  }
  .rpc-tab-btn--active {
    color: var(--primary-text-color); border-bottom-color: var(--primary-color, #2563eb);
    font-weight: 600;
  }
  .rpc-tab-icon  { font-size: 0.95rem; }
  .rpc-tab-label { white-space: nowrap; }
  .rpc-tab-badge {
    position: absolute; top: 4px; right: 18%;
    width: 7px; height: 7px; border-radius: 50%; background: var(--rpc-amber);
  }
  .rpc-tab-panel { padding-top: 4px; }

  /* \u2500\u2500 v1.6 \u2014 History zone: traversal row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-traversal-row  { width: 100%; padding-left: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 3px; font-size: 0.75rem; margin-top: 3px; color: var(--secondary-text-color); }
  .rpc-trav-room      { white-space: nowrap; }
  .rpc-trav-sep       { color: var(--secondary-text-color); font-size: 0.70rem; }
  .rpc-mission-dest-popover { width: 100%; padding-left: 20px; font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* \u2500\u2500 v1.6 \u2014 Health zone: energy row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-energy-val     { font-size: 0.82rem; color: var(--secondary-text-color); margin-left: auto; }

  /* \u2500\u2500 v1.6 \u2014 Schedule zone: optimal window \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-next-clean--optimal .rpc-schedule-time { color: var(--primary-text-color); }
  .rpc-optimal-star   { font-size: 0.70rem; color: var(--rpc-blue); margin-left: 4px; vertical-align: super; }

  /* \u2500\u2500 v1.6 \u2014 Household zone \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .rpc-zone7            { }
  .rpc-household-robot  { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; font-size: 0.82rem; }
  .rpc-household-name   { font-weight: 500; min-width: 80px; }
  .rpc-household-meta   { font-size: 0.75rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-household-combined { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); padding-top: 6px; margin-top: 2px; }
  .rpc-household-divider  { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 4px 0; }
  .rpc-household-floors   { margin-bottom: 4px; }
  .rpc-household-floor    { display: flex; align-items: baseline; gap: 8px; font-size: 0.75rem; color: var(--secondary-text-color); padding: 2px 0; }
  .rpc-household-floor-label { font-weight: 500; }
  /* v2.0 \u2014 household view "\u2190 Back" chip */
  .rpc-household-back {
    background: none; border: none; cursor: pointer; font-family: inherit;
    color: var(--primary-color, #2563eb); font-size: 0.8rem; padding: 4px 2px 10px;
  }
`,Se=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.activeTab=null;this.roomPickerOpen=!1;this.viewMode="robot";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.healthDetailsExpanded=!1;this.openMaintPopover=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=t=>{if(!t.composedPath().includes(this)){let o=!1;this.openPopover!==null&&(this.openPopover=null,o=!0),this.openMaintPopover!==null&&(this.openMaintPopover=null,o=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,o=!0),o&&this.render()}};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}setConfig(t){let r=t.entities&&t.entities.length>0?t.entities:[t.entity];if(!r[0])throw new Error("roomba-plus-card: entity is required");let o=this.activeRobot,s=r.includes(o)?o:r[0],a=s!==o;this.config=t,this.activeRobot=s,this.robotName=s.replace("vacuum.",""),a&&this.resetRobotState(),this.root.innerHTML=`<style>${tt}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(t){let r=this.relevantEntityIds(),o=!this._hass||r.some(c=>t.states[c]?.state!==this._hass.states[c]?.state||t.states[c]?.last_changed!==this._hass.states[c]?.last_changed),s=this._hass;this._hass=t;let a=t.states[`select.${this.robotName}_cleaning_passes`];a&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=Te[a.state]??"Auto");let l=`binary_sensor.${this.robotName}_mission_active`,i=t.states[l]?.state??"";if(i)this.prevMissionActive==="on"&&i==="off"&&this.loadHistory(),this.prevMissionActive=i;else{let c=t.states[this.config.entity]?.state??"";this.prevVacuumState==="cleaning"&&c==="docked"&&this.loadHistory(),this.prevVacuumState=c}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new ue(t,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(t),(!s||o)&&this.render()}relevantEntityIds(){let t=this.robotName;return[this.activeRobot,`sensor.${t}_last_error_code`,`sensor.${t}_last_error_zone`,`sensor.${t}_phase`,`binary_sensor.${t}_mission_active`,`binary_sensor.${t}_maintenance_due`,`sensor.${t}_readiness`,`binary_sensor.${t}_schedule_hold_active`,`sensor.${t}_next_clean`,`sensor.${t}_filter_remaining_hours`,`sensor.${t}_brush_remaining_hours`,`sensor.${t}_mop_pad`,`sensor.${t}_mop_tank_level`,`sensor.${t}_mop_behavior`,`sensor.${t}_clean_base_status`,`sensor.${t}_nav_quality`,`sensor.${t}_next_likely_clean_window`,`sensor.${t}_presence_clean_opportunities_7d`,`sensor.${t}_presence_clean_utilisation_7d`,`sensor.${t}_cleaning_passes`,`select.${t}_cleaning_passes`,`select.${t}_smart_zone_select`,`select.${t}_zone_select`,`sensor.${t}_clean_streak`,`sensor.${t}_completion_rate_30d`,`sensor.${t}_lifetime_missions`,`sensor.${t}_cleaning_analytics_30d`,`sensor.${t}_battery_capacity_retention`,`sensor.${t}_estimated_battery_eol`,`sensor.${t}_wifi_health`,`sensor.${t}_recent_coverage_pct`,`sensor.${t}_missions_last_30d`,`sensor.${t}_average_mission_time`,`sensor.${t}_cleaning_performance`,`binary_sensor.${t}_consecutive_clean_skips`,`sensor.${t}_area_cleaned_today`,`sensor.${t}_mission_expire_time`,`image.${t}_coverage_map`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.healthDetailsExpanded=!1,this.openMaintPopover=null,this.activeTab=null,this.roomPickerOpen=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(t=>{t!==null&&clearTimeout(t)})}async switchRobot(t){if(t===this.activeRobot)return;this.activeRobot=t,this.robotName=t.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new ue(this._hass,this.config,t),this.loadHistory()),this.render();let r=this.config.robot_selector_helper;if(r&&this._hass.states[r]){let o=r.split(".")[0],s=o==="input_select"?"select_option":"set_value",a=o==="input_select"?{entity_id:r,option:t}:{entity_id:r,value:t};try{await this._hass.callService(o,s,a)}catch(l){console.warn("roomba-plus-card: robot_selector_helper write failed",l)}}}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let t=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let r=this.config.history_days??28,o=await this.apiClient.fetchSummary(r),s=await this.apiClient.fetchRecords(r);if(s.length>0){let i=new Map;for(let c of s){let p=c.started_at.slice(0,10);i.has(p)||i.set(p,[]),i.get(p).push(c)}for(let c of o){let p=i.get(c.date);p&&(c.missions=p.sort((d,h)=>d.started_at.localeCompare(h.started_at)))}}let a=await this.apiClient.fetchHazards(),l=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(r):null;this.missionData=o,this.firstRecord=s.length>0?s[s.length-1]:null,this.firstSummary=o.length>0?o[o.length-1]:null,this.hazards=a,this.householdData=l}catch(r){let o=r.message;this.historyError=o==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==t)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let t=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=this._hass.config?.unit_system?.length==="m",o=new Date,s=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`,l=(this.missionData?.find(y=>y.date===s)??null)?.total??null;this.activeTab===null&&(this.activeTab=ke(this.config,t));let i=Je(this.config,t);i.some(y=>y.id===this.activeTab)||(this.activeTab=ke(this.config,t));let c=Ve(this._hass,this.config,t,this.robotName),p=c;c?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=c):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),p=this.lastAlertHtml);let d=Ke({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:l,missionData:this.missionData,roomPickerOpen:this.roomPickerOpen,selectedRoomCount:this.selectedRooms.size}),h=this.roomPickerOpen?ve({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:!1}):"",v={health:Qe(this._hass,t,this.robotName),history:Xe(this._hass,t,this.robotName)},S=et(i,this.activeTab,v),m="";switch(this.activeTab){case"map":m=we(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:"coverage",hazards:this.hazards,mapSelectedRooms:this.selectedRooms,suppressSubTabToggle:!0},r);break;case"history":m=we(this._hass,this.config,t,this.robotName,{data:this.missionData,loading:this.historyLoading,error:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.config.mode==="companion"?this.historyTab:"calendar",hazards:this.hazards,suppressSubTabToggle:this.config.mode!=="companion"},r);break;case"health":m=`
          ${p}
          ${Me(this._hass,this.config,t,this.robotName,{openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown,healthDetailsExpanded:this.healthDetailsExpanded,openMaintPopover:this.openMaintPopover})}
        `;break;case"settings":m=`
          ${Ae(this._hass,this.config,t,this.robotName,{holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling})}
          <div class="rpc-settings-divider"></div>
          ${fe(this._hass,this.config,this.robotName,this.settingsPanelOpen)}
          ${this.config.mode!=="companion"?ve({hass:this._hass,config:this.config,caps:t,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:this.settingsPanelOpen,includeSettingsPanel:!1}):""}
          ${this.renderMaintenanceLinks(t)}
        `;break}let u=this.viewMode==="household"?`
        <button class="rpc-household-back" data-household-back>\u2190 Back</button>
        ${Ye(this._hass,this.config,t,this.householdData,r)}
      `:`
        ${d}
        ${h}
        ${S}
        <div class="rpc-tab-panel">
          ${m}
        </div>
      `,f=`
      <style>${tt}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${u}
      </div>
    `;this.root.innerHTML=f,this.attachEventListeners()}renderMaintenanceLinks(t){if(!t.hasMaintenanceCalendar&&!this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`])return"";let r=this.robotName,o=[];return this._hass.states[`sensor.${r}_wheel_last_cleaned`]&&o.push({label:"Wheel cleaning",service:"roomba_plus.reset_wheel_cleaning"}),this._hass.states[`sensor.${r}_contact_last_cleaned`]&&o.push({label:"Contact cleaning",service:"roomba_plus.reset_contact_cleaning"}),this._hass.states[`sensor.${r}_bin_last_cleaned`]&&o.push({label:"Bin cleaning",service:"roomba_plus.reset_bin_cleaning"}),this._hass.states[`sensor.${r}_battery_capacity_retention`]&&o.push({label:"Battery baseline",service:"roomba_plus.reset_battery"}),o.length===0?"":`
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${o.map(s=>`
        <div class="rpc-maint-link-row">
          <span class="rpc-maint-link-label">${s.label}</span>
          <span class="rpc-maint-link-service">${s.service}</span>
        </div>
      `).join("")}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools \u2192 Services</div>
    `}renderRobotSelectorBar(){let t=this.entityList();if(t.length<2)return"";let r=t.map(s=>{let a=this._hass.states[s]?.attributes?.friendly_name??s,l=this.viewMode==="robot"&&s===this.activeRobot?" selected":"";return`<option value="${s}"${l}>${a}</option>`}).join(""),o=this.viewMode==="household"?" selected":"";return`
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${r}</optgroup>
          <optgroup label="View">
            <option value="__household__"${o}>\u{1F4CA} Household summary</option>
          </optgroup>
        </select>
      </div>`}attachEventListeners(){let t=this.root.querySelector(".rpc-card"),r=t.querySelector("[data-robot-select]");r&&r.addEventListener("change",a=>{a.stopPropagation();let l=a.target.value;l==="__household__"?(this.viewMode="household",this.render()):(this.viewMode="robot",this.switchRobot(l))}),t.querySelectorAll("[data-action]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.handleAction(a.dataset.action)})}),t.querySelectorAll("[data-room]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation();let i=a.dataset.room;this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render()})}),t.querySelectorAll("[data-pass]").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();let i=a.dataset.pass,c=a.dataset.passOption;this.passes=i,this.render();let p=`select.${this.robotName}_cleaning_passes`;if(this._hass.states[p]){this.passSettingInFlight=!0;try{await this._hass.callService("select","select_option",{entity_id:p,option:c})}catch{}finally{this.passSettingInFlight=!1}}})}),t.querySelectorAll("[data-bar]").forEach(a=>{let l=i=>{i.stopPropagation();let c=a.dataset.bar;this.openPopover=this.openPopover===c?null:c,this.resetError=null,this.render(),!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0)};a.addEventListener("click",l),a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),l(i))})}),t.querySelectorAll("[data-tab]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation();let i=a.dataset.tab;i!==this.activeTab&&(this.activeTab=i,this.render())})});let o=t.querySelector("[data-household-back]");o&&o.addEventListener("click",a=>{a.stopPropagation(),this.viewMode="robot",this.render()}),t.querySelectorAll("[data-room-poly], [data-room-label]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation();let i=a.dataset.roomPoly??a.dataset.roomLabel;i&&(this.selectedRooms.has(i)?this.selectedRooms.delete(i):this.selectedRooms.add(i),this.render())})}),t.querySelectorAll("[data-close]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.openPopover=null,this.render()})}),t.querySelectorAll("[data-health-details-toggle]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.healthDetailsExpanded=!this.healthDetailsExpanded,this.render()})}),t.querySelectorAll("[data-maint]").forEach(a=>{let l=i=>{i.stopPropagation();let c=a.dataset.maint;this.openMaintPopover=this.openMaintPopover===c?null:c,this.render()};a.addEventListener("click",l),a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),l(i))})}),t.querySelectorAll("[data-close-maint]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.openMaintPopover=null,this.render()})}),t.querySelectorAll("[data-reset]").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();let i=a.dataset.reset,c=a.dataset.service;this.resetting=i,this.resetError=null,this.render();try{await this._hass.callService("roomba_plus",c,{entity_id:this.config.entity}),await new Promise(p=>setTimeout(p,800)),this.openPopover=null}catch{this.resetError=i}finally{this.resetting=null,this.render()}})}),t.querySelectorAll("[data-hold-action]").forEach(a=>{a.addEventListener("click",async l=>{if(l.stopPropagation(),a.dataset.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let i=`switch.${this.robotName}_schedule_hold`,c=this._hass.states[i]?.state==="on";this.holdToggling=!0,this.render();try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}finally{this.holdToggling=!1,this.render()}}})});let s=t.querySelector("[data-heatmap]");s&&s.addEventListener("click",a=>{a.stopPropagation();let l=a.target.closest("[data-date]");if(!l)return;let i=l.getAttribute("data-date");this.openDay===i?(this.openDay=null,this.dayMissions=null,this.openDaySummary=null):(this.openDay=i,this.openDaySummary=this.missionData?.find(c=>c.date===i)??null,this.dayMissions=this.buildDayMissions(i)),this.render()}),t.querySelectorAll("[data-close-day]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})}),t.querySelectorAll("[data-settings-toggle]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.settingsPanelOpen=!this.settingsPanelOpen,this.render()})}),t.querySelectorAll("[data-switch-entity]").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();let i=a.dataset.switchEntity,c=this._hass.states[i]?.state==="on";try{await this._hass.callService("switch",c?"turn_off":"turn_on",{entity_id:i})}catch{}})}),t.querySelectorAll("[data-cycle-entity]").forEach(a=>{a.addEventListener("click",async l=>{l.stopPropagation();let i=a.dataset.cycleEntity,c=JSON.parse(a.dataset.cycleOptions??"[]"),p=a.dataset.cycleCurrent??"",d=c.indexOf(p),h=c.length>0?c[(d+1)%c.length]:null;if(h)try{await this._hass.callService("select","select_option",{entity_id:i,option:h})}catch{}})}),t.querySelectorAll("[data-lifetime-toggle]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.lifetimeExpanded=!this.lifetimeExpanded,this.render()})}),t.querySelectorAll("[data-history-tab]").forEach(a=>{a.addEventListener("click",l=>{l.stopPropagation(),this.historyTab=a.dataset.historyTab,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.render()})})}buildDayMissions(t){let r=this.missionData?.find(o=>o.date===t);return!r||r.total===0?[]:r.missions&&r.missions.length>0?r.missions:[]}async handleAction(t){let{entity:r}=this.config,o=this.robotName;if(t==="clean-selected"){this.isSendingClean=!0,this.sendError=null,this.render();let c=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let p=`select.${o}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[p]&&await this._hass.callService("select","select_option",{entity_id:p,option:be[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:r,room_name:c,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render();return}if(t==="repeat-last"){try{await this._hass.callService("button","press",{entity_id:`button.${o}_repeat_mission`})}catch{}return}if(t==="toggle-room-picker"){this.roomPickerOpen=!this.roomPickerOpen,this.render();return}let a={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"],stop:["vacuum","stop"],retry:["vacuum","start"]}[t];if(!a)return;let[l,i]=a;if(this.loadingAction=t,this.render(),t==="locate"){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(l,i,{entity_id:r})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(l,i,{entity_id:r})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let t=ge(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=4;return t.hasZones&&this.config.show_rooms!==!1&&(r+=3),this.config.show_health!==!1&&(r+=2),this.config.show_schedule!==!1&&(r+=2),this.config.show_history!==!1&&(r+=4),r}static getConfigForm(){return{schema:[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"show_rooms",label:"Show room selector zone",selector:{boolean:{}}},{name:"show_settings",label:"Show settings panel",selector:{boolean:{}}},{name:"show_health",label:"Show health zone",selector:{boolean:{}}},{name:"show_schedule",label:"Show schedule & presence zone",selector:{boolean:{}}},{name:"show_alerts",label:"Show alerts zone",selector:{boolean:{}}},{name:"show_history",label:"Show history zone",selector:{boolean:{}}},{name:"show_lifetime",label:"Show lifetime stats",selector:{boolean:{}}},{name:"show_dirt_events",label:"Show dirt events in day detail",selector:{boolean:{}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}}]}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",Se);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
