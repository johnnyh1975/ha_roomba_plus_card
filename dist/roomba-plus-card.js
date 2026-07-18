function Ae(t,n,e,r,a){let s=l=>!!t.states[`sensor.${n}_${l}`],o=l=>!!t.states[`select.${n}_${l}`],i=l=>!!t.states[`binary_sensor.${n}_${l}`],c=l=>!!t.states[`image.${n}_${l}`],d=s("mop_pad"),p=s("brush_remaining_hours");return{hasArea:s("area_cleaned_today"),hasBrush:p,hasPad:d,hasWater:s("mop_tank_level"),hasCleanBase:s("clean_base_status"),hasZones:o("smart_zone_select")||o("zone_select"),hasSmartZones:o("smart_zone_select"),hasProblemZone:s("problem_zone"),hasLifetimeArea:s("cleaning_analytics_30d"),hasWearRate:s("filter_wear_rate"),isMop:d&&!p,hasMissionActive:i("mission_active"),hasMissionPhase:s("phase"),hasCleaningSpeedTrend:s("cleaning_performance"),hasBatteryRetention:s("battery_capacity_retention"),hasWifiFloor:s("wifi_health"),hasCoveragePct:s("recent_coverage_pct"),hasBatteryEol:s("estimated_battery_eol"),hasConsecutiveSkips:s("consecutive_clean_skips"),hasMopBehavior:s("mop_behavior"),hasCoverageImage:c("coverage_map"),hasWifiSignal:r?.wifi_signal!=null,hasRoomCoverage:r!=null&&"room_coverage"in r,hasDirtDensity:a!=null&&"dirt_density"in a,hasRobotSelectorHelper:!!e.robot_selector_helper&&!!t.states[e.robot_selector_helper],hasCleanedRooms:Array.isArray(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms)&&(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:i("demand_clean_blocked"),hasEnergyConsumption:s("total_energy_consumed"),hasOptimalWindow:s("optimal_clean_window"),hasRobotHealthScore:s("robot_health_score"),hasNavStats:s("nav_panics")||s("nav_landmark_quality"),hasMaintenanceCalendar:s("wheel_last_cleaned")||s("contact_last_cleaned")||s("bin_last_cleaned"),hasMissionProgressSensor:s("mission_progress"),hasAlignment:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.rooms;return!!l&&typeof l=="object"&&Object.keys(l).length>0})(),hasZoneOverlays:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.zones;return Array.isArray(l)&&l.length>0})(),hasDoorMarkers:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.door_markers;return Array.isArray(l)&&l.length>0})(),hasFurnitureShadows:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.furniture_candidates;return Array.isArray(l)&&l.length>0})(),hasRoomAccess:s("room_accessibility_scores"),hasFavorites:Object.keys(t.states).some(l=>l.startsWith(`button.${n}_fav_`)),hasConnectivity:i("cloud_connected")||i("mqtt_stale"),hasFirmware:s("firmware_version"),hasPositionTracker:!!t.states[`device_tracker.${n}_position`],hasRoomsOverdue:s("rooms_overdue"),hasDirtCorrelation:s("dirt_weather_correlation")}}var ke=class{constructor(n,e,r){this.hass=n;this.entryId=null;this.entityId=r??e.entity}updateHass(n){this.hass=n}async fetchSummary(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,a=await this.hass.fetchWithAuth(r);if(!a.ok)throw new Error(`${a.status}`);return a.json()}async fetchRecords(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,a=await this.hass.fetchWithAuth(r);return a.ok?a.json():[]}async fetchExplain(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission/${encodeURIComponent(n)}/explain`,a=await this.hass.fetchWithAuth(r);return a.ok?a.json():null}async fetchPath(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission/${n}/path`,a=await this.hass.fetchWithAuth(r);return a.ok?a.json():null}async fetchMissionMap(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/missions/${encodeURIComponent(n)}/map.json`,a;try{a=await this.hass.fetchWithAuth(r)}catch{return{status:"error"}}if(a.status===404)return{status:"absent"};if(!a.ok)return{status:"error"};try{return{status:"ok",data:await a.json()}}catch{return{status:"error"}}}async getEntryId(){return this.resolveEntryId()}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}async fetchHazards(){let e=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():[]}async fetchHousehold(n){let e=`/api/roomba_plus/household?days=${n}`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():null}};function h(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function J(t,n="en"){let e=Date.now()-new Date(t).getTime(),r=Math.floor(e/6e4);try{let a=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(r<1)return a.format(0,"minute");if(r<60)return a.format(-r,"minute");let s=Math.floor(r/60);if(s<24)return a.format(-s,"hour");let o=Math.floor(s/24);return o<30?a.format(-o,"day"):a.format(-Math.floor(o/30),"month")}catch{if(r<1)return"just now";if(r<60)return`${r}m ago`;let a=Math.floor(r/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}}var ve={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},Be="\u{1F4CD}";var Te={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},je={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function He(t,n,e,r,a=!1){if(n.show_settings===!1)return"";let s=e,o=t.states[`switch.${s}_edge_clean`],i=t.states[`switch.${s}_always_finish`],c=t.states[`select.${s}_carpet_boost_select`];if(!o&&!i&&!c)return"";let d="";if(r){let u=o?.state==="on",y=i?.state==="on",k=c?c.attributes.options??[]:[];d=`
      <div class="rpc-settings-panel">
        ${o?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${u?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_edge_clean"
                    aria-pressed="${u}">
              ${u?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${y?" rpc-setting-on":""}"
                    data-switch-entity="switch.${s}_always_finish"
                    aria-pressed="${y}">
              ${y?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${c?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${s}_carpet_boost_select"
                    data-cycle-options="${h(JSON.stringify(k))}"
                    data-cycle-current="${h(c.state)}">
              ${h(c.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${a?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${a?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${r}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${r?"\u25B2":"\u25BC"}</span>
    </button>
    ${d}
  `}function Me(t){let{hass:n,config:e,caps:r,robotName:a,selectedRooms:s,passes:o,isSending:i,sendError:c,settingsPanelOpen:d,includeSettingsPanel:p=!0}=t;if(!r.hasSmartZones||e.show_rooms===!1)return"";let l=a,u=n.states[`select.${l}_smart_zone_select`];if(!u)return"";let y=u.attributes.options??[];if(y.length===0)return"";let k=n.states[`button.${l}_repeat_mission`],g=!!k&&k.state!=="unavailable",b=n.states[`select.${l}_cleaning_passes`],R=r.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",f=s.size,M='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',v=(()=>{let H=r.hasSmartZones?`select.${a}_smart_zone_select`:`select.${a}_zone_select`,A=n.states[H]?.attributes?.region_icons;return A&&typeof A=="object"&&!Array.isArray(A)?A:{}})(),$=y.map(H=>{let A=s.has(H),G=v[H],X=G?ve[G]??Be:"",K=X?`${X} ${h(H)}`:h(H);return`<button class="rpc-room-chip${A?" rpc-room-chip--selected":""}"
      data-room="${h(H)}" aria-pressed="${A}">${K}</button>`}).join(""),_="";if(b){let H=o;_=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(A=>`<button class="rpc-pass-chip${H===A?" rpc-pass-chip--selected":""}"
            data-pass="${A}"
            data-pass-option="${h(Te[A]??A)}">${A}</button>`).join("")}
      </div>
    `}let E=p?He(n,e,a,d):"";return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${$}
        ${f>0?`<span class="rpc-selected-count">${f} selected</span>`:""}
      </div>
      ${_}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${f===0||i?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${f===0||i?"disabled":""}
                aria-label="${R}">
          ${i?M+" Sending\u2026":R}
        </button>
        ${g?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${c?`<div class="rpc-send-error">${h(c)}</div>`:""}
      ${E}
    </div>
  `}var We={completed:"#2d9c4f",stuck:"#dc2626",error:"#d97706",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},Q=24,ze=2,$e=20,Pe=18,de=Q+ze;function Ze(t=7){return $e+t*de-ze}function qe(t){return Pe+t*de-ze+4}function Tt(t,n){return t.toLocaleDateString(n,{month:"short",day:"numeric"})}function Ve(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function Ke(t,n,e,r="en-US",a=!1){let s=new Map;for(let g of t)s.set(g.date,g);let o=new Date,i=new Date(o);i.setDate(o.getDate()-(n-1));let c=(i.getDay()+6)%7;i.setDate(i.getDate()-c);let d=Math.ceil((n+c)/7),p=[];for(let g=0;g<d;g++)for(let b=0;b<7;b++){let T=new Date(i);T.setDate(i.getDate()+g*7+b),!(T>o)&&p.push({date:T,summary:s.get(Ve(T))??null,col:b,row:g})}let l=Ze(),u=qe(d),y=["Mo","Tu","We","Th","Fr","Sa","Su"],k=`<svg width="${l}" height="${u}" viewBox="0 0 ${l} ${u}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let g=0;g<7;g++){let b=$e+g*de+Q/2;k+=`<text x="${b}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${y[g]}</text>`}for(let g of p){let b=$e+g.col*de,T=Pe+g.row*de,R=g.summary?.result??"none",f=We[R]??We.none,M=g.summary?.total??0,v=Tt(g.date,r);if(M===0?v+=": no missions":M===1?v+=`: 1 mission, ${R}`:v+=`: ${M} missions, ${R}`,g.col===0){let _=g.date.getDate();k+=`<text x="${$e-3}" y="${T+Q/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${_}</text>`}let $="";if(a&&g.summary?.relative_to_baseline!=null){let _=g.summary.relative_to_baseline;$=` opacity="${Math.min(1,Math.max(.5,.5+_/4)).toFixed(2)}"`}if(k+=`<g role="gridcell" aria-label="${v}" data-date="${Ve(g.date)}" data-result="${R}" data-total="${M}" style="cursor:pointer">`,k+=`<rect x="${b-2}" y="${T-2}" width="${Q+4}" height="${Q+4}" fill="transparent" rx="4"/>`,k+=`<rect x="${b}" y="${T}" width="${Q}" height="${Q}" fill="${f}" rx="3"${$}/>`,M>1){let _=Math.min(M,3);for(let E=0;E<_;E++){let H=b+Q-4-E*5,A=T+Q-3;k+=`<circle cx="${H}" cy="${A}" r="2" fill="rgba(255,255,255,0.75)"/>`}}k+="</g>"}return k+="</svg>",k}function Ue(t){if(!t||t.length!==5)return null;let n=t.reduce((r,a)=>r+a,0);if(n===0)return null;let e=t.reduce((r,a,s)=>r+s*a,0)/n;return Math.round(e/4*100*10)/10}function Ye(t){if(!t||t.length===0)return[];if(t.length===5){let e=t.reduce((r,a)=>r+a,0);return e===0?[0,0,0,0,0]:t.map(r=>Math.round(r/e*100))}return t.every(e=>e<=4)?t.map(e=>e*25):t}function Ge(t,n,e,r,a,s){let o=((t-e)/(r-e)*100).toFixed(1)+"%",i=((s-n)/(s-a)*100).toFixed(1)+"%";return{left:o,top:i}}function Xe(t){return t<=4?t*25:t}function Je(t,n){if(!t||t.length===0)return"";let e=7,r=t.length<=e?[...t]:Array.from({length:e},(u,y)=>t[Math.round(y/(e-1)*(t.length-1))]),a=Math.max(...r,1),s=r.length,o=6,i=2,c=s*o+(s-1)*i,d=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",l="";for(let u=0;u<s;u++){let y=u*(o+i),k=Math.max(2,Math.round(r[u]/a*d)),g=d-k;l+=`<rect x="${y}" y="${g}" width="${o}" height="${k}" fill="${p}" rx="1"/>`}return`<svg width="${c}" height="${d}" viewBox="0 0 ${c} ${d}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${l}</svg>`}function Qe(t=4){let n=Ze(),e=qe(t),r=["Mo","Tu","We","Th","Fr","Sa","Su"],a=`<svg width="${n}" height="${e}" viewBox="0 0 ${n} ${e}" xmlns="http://www.w3.org/2000/svg">`;a+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let s=0;s<7;s++){let o=$e+s*de+Q/2;a+=`<text x="${o}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${r[s]}</text>`}for(let s=0;s<t;s++)for(let o=0;o<7;o++){let i=$e+o*de,c=Pe+s*de;a+=`<rect x="${i}" y="${c}" width="${Q}" height="${Q}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(s*7+o)*30}ms"/>`}return a+="</svg>",a}function et(t,n,e){let r=e,a=[],s=t.states[`vacuum.${r}`],o=!!s&&(s.state==="error"||!!s.attributes?.error_code),i=t.states[`sensor.${r}_last_error_code`];if(o&&i&&i.state!=="0"&&i.state!==""&&i.state!=="unknown"&&i.state!=="unavailable"){let l=h(i.attributes.label??`Error ${i.state}`),u=h(i.attributes.description??""),y=h(i.attributes.action??""),k=[u,y].filter(Boolean).join(" ")||void 0;a.push({priority:1,text:`Error: ${l}`,subtext:k,category:"none"})}else if(o){let l=s.attributes?.error_code,u=s.attributes?.error,y=u?`Error: ${h(u)}`:l!=null?`Error: Error ${h(String(l))}`:"Robot error \u2014 check the iRobot app";a.push({priority:1,text:y,category:"none"})}let c=t.states[`binary_sensor.${r}_maintenance_due`];if(c&&c.state==="on"){let l=t.states[`sensor.${r}_readiness`]?.state??"",u="Maintenance due";l==="bin_full"||l==="Bin Full"?u="Bin full \u2014 empty to continue":l&&l!=="Ready"&&l!=="unknown"&&l!=="unavailable"&&(u="Robot not ready \u2014 check the app"),a.push({priority:2,text:u,category:"health"})}if(n.hasWearRate){let l=t.states[`sensor.${r}_filter_wear_rate`],u=t.states[`sensor.${r}_filter_remaining_hours`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"&&u){let g=u.attributes.threshold_hours,b=parseFloat(l.state)/(g/90);b>1.5&&a.push({priority:3,text:`Filter wearing ${b.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup.",category:"health"})}let y=t.states[`sensor.${r}_brush_wear_rate`],k=t.states[`sensor.${r}_brush_remaining_hours`];if(y&&y.state!=="unknown"&&y.state!=="unavailable"&&k){let g=k.attributes.threshold_hours,b=parseFloat(y.state)/(g/90);b>1.5&&a.push({priority:4,text:`Brush wearing ${b.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles.",category:"health"})}}let d=t.states[`sensor.${r}_nav_quality`];if(d&&d.state!=="unknown"&&d.state!=="unavailable"){let l=parseInt(d.state,10);!isNaN(l)&&l<60&&a.push({priority:5,text:`Navigation quality low (${l}/100)`,subtext:"Check lighting or move obstacles in the cleaning area.",category:"health"})}if(n.hasConsecutiveSkips){let l=t.states[`sensor.${r}_consecutive_clean_skips`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let u=parseInt(l.state,10);if(!isNaN(u)&&u>0){let y=`Robot blocked from cleaning ${u} consecutive time${u!==1?"s":""}`;a.push({priority:6,text:y,subtext:"Check blocking sensors or robot placement.",category:"health"})}}}if(n.hasWifiFloor){let l=t.states[`sensor.${r}_wifi_health`],u=l?.attributes?.weakest_bucket_observed;if(l&&typeof u=="number"&&!isNaN(u)){let y=Xe(u);y<50&&a.push({priority:7,text:`Wi-Fi signal dropped to ${y}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender.",category:"history"})}}let p=t.states[`binary_sensor.${r}_layout_change_detected`];return p&&p.state==="on"&&a.push({priority:8,text:"Room layout may have changed",subtext:"Coverage pattern diverges from this robot\u2019s learned layout \u2014 moved furniture, or a new/removed obstacle.",category:"health"}),a}function De(t,n,e,r){return et(t,n,e).some(a=>a.category===r)}function tt(t,n,e,r){if(n.show_alerts===!1)return"";let a=et(t,e,r);if(a.length===0)return"";let s=a.sort((o,i)=>o.priority-i.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${s.text}</div>
          ${s.subtext?`<div class="rpc-alert-sub">${s.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function rt(t,n,e,r,a){if((n.entities?.length??0)<2||!r)return"";let s=n.area_unit??"auto",o=s==="m2"||s==="auto"&&a;function i(g){return g==null?"":o?`${Math.round(g*.0929)} m\xB2`:`${Math.round(g)} ft\xB2`}function c(g){return g>=90?"rpc-cov-green":g>=70?"rpc-cov-amber":"rpc-cov-red"}let d=r.robots.map(g=>{let b=Math.round(g.completion_pct),T=i(g.area_sqft),R=[`${g.missions} mission${g.missions!==1?"s":""}`,T].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${h(g.name)}</span>
        <span class="${c(b)}">${b}%</span>
        <span class="rpc-household-meta">${R}</span>
      </div>`}).join(""),p="";r.floors&&r.floors.length>1&&(p=`<div class="rpc-household-floors">${r.floors.map(b=>{let T=i(b.area_sqft),R=[`${b.missions} mission${b.missions!==1?"s":""}`,T].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${h(b.label)}</span>
          <span class="rpc-household-meta">${R}</span>
        </div>`}).join("")}</div>`);let l=r.total,u=Math.round(l.completion_pct),y=i(l.area_sqft),k=[`${l.missions} mission${l.missions!==1?"s":""}`,y].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${r.period_days} DAYS</div>
      ${d}
      ${p}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${c(u)}">${u}%</span>
        <span class="rpc-household-meta">${k}</span>
      </div>
    </div>`}function be(t,n){return t.states[n]?.state??"unavailable"}function nt(t,n,e){return n==="m2"||n==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Ht(t,n){if(!t)return null;for(let e=t.length-1;e>=0;e--){let r=t[e];if(r.missions&&r.missions.length>0)for(let a=r.missions.length-1;a>=0;a--){let s=r.missions[a];if(s.result==="completed")return J(s.started_at,n)}else if(r.completed>0)return J(r.date+"T12:00:00Z",n)}return null}function zt(t){let n=["th","st","nd","rd"],e=t%100;return t+(n[(e-20)%10]??n[e]??n[0])}function st(t){let{hass:n,config:e,caps:r,robotName:a,loadingAction:s,todayMissionCount:o,roomPickerOpen:i,selectedRoomCount:c}=t,d=t.activeRobot??e.entity,p=be(n,d),l=n.states[d]?.attributes??{},u=n.config?.unit_system?.length==="m",y=e.area_unit??"auto",k=p==="unavailable",g=s!==null,b=a,T=`sensor.${b}_last_error_code`,R=`sensor.${b}_last_error_zone`,f=`sensor.${b}_mission_recharge_time`,M=`sensor.${b}_average_mission_time`,v=`sensor.${b}_area_cleaned_today`,$=l.mission_elapsed_min??null,_=l.mission_area_sqft??null,E=parseFloat(be(n,M)),H=isNaN(E)||E<=0?45:E,A=r.isMop,G=A?"\u{1F9F9}":"\u{1F916}",X=h(l.friendly_name??d),K=n.states[`sensor.${b}_phase`]?.state??"",se=(n.states[`binary_sensor.${b}_mission_active`]?.state??"")==="on",ee=r.hasMissionActive,L=n.states[`sensor.${b}_mission_expire_time`]?.state??"",I=L&&L!=="unavailable"&&L!=="unknown"?new Date(L):null,W=!!I&&!isNaN(I.getTime())&&I>new Date,j=W?Math.max(1,Math.round((I.getTime()-Date.now())/6e4)):null,O=!1;if(ee)O=p==="docked"&&se;else{let m=be(n,f);O=p==="docked"&&(m!=="unavailable"&&m!=="unknown"&&L!=="unavailable"&&L!=="unknown")&&W}let Y="";if(O&&r.hasMissionProgressSensor){let w=n.states[`sensor.${b}_mission_progress`]?.attributes?.recharge_min;typeof w=="number"&&(Y=`<div class="rpc-recharge-line">\u26A1 Recharging \xB7 ${Math.round(w)} min</div>`)}let x="",B="",q="";if(K==="evac")x="\u2B06",B="Emptying bin";else if(O)x="\u26A1",B=j!==null?`Recharging \u2014 resuming in ~${j} min`:"Recharging \u2014 mission continues";else switch(p){case"cleaning":x="\u25CF",B=A?"Mopping":"Cleaning";break;case"paused":x="\u23F8",B="Paused";break;case"returning":x="\u21A9",B="Returning to dock";break;case"docked":x="\u2713",B="Docked";break;case"idle":x="\u25CB",B="Idle";break;case"error":x="\u26A0",B="Error",q="rpc-error-state";break;case"unavailable":x="\u2014",B="Unavailable";break}let ue="";if(p==="error"){let m=n.states[T];if(m&&m.state!=="0"&&m.state!==""&&m.state!=="unavailable"){let w=h(m.attributes.description??"Unknown error"),D=h(m.attributes.action??""),N=be(n,R),S=N&&N!=="unknown"&&N!=="unavailable";B=`Error ${h(m.state)} \u2014 ${w}`,ue=`
        ${D?`<div class="rpc-error-action">${D}</div>`:""}
        ${S?`<div class="rpc-error-zone">Zone: ${h(N)}</div>`:""}
      `}else B="Robot error \u2014 check the iRobot app"}let U="";if((ee?se:p==="cleaning"||O)&&r.hasArea){let m=parseFloat(be(n,v));if(!isNaN(m)&&m>0){let w=nt(m,y,u),D=o!==null?o+1:null,N=D!==null&&D>1?` \xB7 ${h(zt(D))} mission`:"";U=`<div class="rpc-area-today">${w} already today${N}</div>`}}let ae="";p==="cleaning"&&$!==null&&(ae=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min($/H*100,95)}%"></div></div>`);let oe="";if(p==="cleaning")if(r.hasMissionProgressSensor){let m=n.states[`sensor.${b}_mission_progress`],w=m?.attributes?.current_room,D=m&&m.state!=="unavailable"&&m.state!=="unknown"?parseFloat(m.state):NaN;if(w||!isNaN(D)){let N=[];w&&N.push(h(w)),isNaN(D)||N.push(`${Math.round(D)}%`);let S=m?.attributes?.mission_duration_min,z=m?.attributes?.recharge_min;typeof S=="number"&&typeof z=="number"&&z>0&&N.push(`${Math.round(S)} min (${Math.round(z)} min charging)`),oe=`<div class="rpc-spatial-line">${N.join(" \xB7 ")}</div>`}}else{let m=l.mission_destination;m&&(oe=`<div class="rpc-spatial-line">\u2192 Targeting: ${h(m)}</div>`)}let ye="";if(p==="cleaning"){let m=[];if($!==null){let w=Math.max(0,Math.round(H-$));m.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${w} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(r.hasArea&&_!==null){m.push(`<div class="rpc-metric"><span class="rpc-metric-val">${nt(_,y,u)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let w=parseFloat(be(n,`sensor.${b}_cleaning_analytics_30d`)),D=parseFloat(be(n,`sensor.${b}_missions_last_30d`)),N=!isNaN(w)&&!isNaN(D)&&D>=5?w/D:NaN;if(!isNaN(N)&&N>0){let S=Math.round((_-N)/N*100),z=S>=0?"\u25B2":"\u25BC",F=S>=0?"rpc-delta-up":"rpc-delta-down";m.push(`<div class="rpc-metric"><span class="rpc-metric-val ${F}">${z} ${Math.abs(S)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}m.length&&(ye=`<div class="rpc-metrics-row">${m.join("")}</div>`)}let ie="";if(p==="docked"&&!O){let m=Ht(t.missionData,n.language);if(m)ie=`<div class="rpc-docked-since">Last cleaned: ${m}</div>`;else{let w=n.states[d]?.last_changed;w&&(ie=`<div class="rpc-docked-since">Last mission: ${J(w,n.language)}</div>`)}}let we="";r.hasDemandBlocked&&n.states[`binary_sensor.${b}_demand_clean_blocked`]?.state==="on"&&(we='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let le="";if(r.hasCleanedRooms&&(p==="docked"||p==="idle")&&!O){let m=l.last_cleaned_rooms,w=l.region_icons;m&&m.length>0&&(le=`<div class="rpc-cleaned-rooms">${m.map(N=>{let S=w?.[N],z=S?ve[S]??"":"";return`<span class="rpc-cleaned-chip">${z?z+"\xA0":""}${h(N)}</span>`}).join("")}</div>`)}let ce="";if(r.hasConnectivity){let m=n.states[`binary_sensor.${b}_cloud_connected`]?.state,w=n.states[`binary_sensor.${b}_mqtt_stale`]?.state,D=m==="off",N=w==="on";if(D||N){let S=N?"Robot offline":"Cloud offline";ce=`<span class="rpc-connectivity rpc-connectivity-degraded" title="${h(S)}">\u2601 ${h(S)}</span>`}}let _e="";if(r.hasFirmware){let m=n.states[`sensor.${b}_firmware_version`],w=m?.state;if(w&&w!=="unavailable"&&w!=="unknown"){let D=m?.last_changed?new Date(m.last_changed).getTime():0;D>0&&Date.now()-D<24*60*60*1e3&&(_e=`<span class="rpc-firmware-badge" title="Firmware updated">\u2B06 FW ${h(w)}</span>`)}}let pe="",me=new Set(["Docked","Angedockt","Cleaning","Unterwegs","unknown","unavailable"]),P=oe!=="";if(r.hasPositionTracker&&!P&&(p==="cleaning"||ee&&se)){let m=n.states[`device_tracker.${b}_position`]?.state;m&&!me.has(m)&&(pe=`<div class="rpc-current-room">\u{1F4CD} ${h(m)}</div>`)}let re='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',V=(m,w,D)=>{let N=s===m;return`<button class="rpc-btn${N?" rpc-btn-loading":""}"
      data-action="${m}"
      ${k||g?"disabled":""}
      aria-label="${w}">
      ${N?re:D}
    </button>`},C="",Z=r.hasDemandBlocked&&n.states[`binary_sensor.${b}_demand_clean_blocked`]?.state==="on";return p==="cleaning"||K==="evac"?C=V("pause","Pause","\u23F8 Pause")+V("return_home","Return home","\u{1F3E0} Return home"):p==="paused"?C=V("resume","Resume","\u25B6 Resume")+V("return_home","Return home","\u{1F3E0} Return home")+V("stop","Stop","\u23F9 Stop"):p==="error"?C=V("return_home","Return home","\u{1F3E0} Return home")+V("retry","Retry","\u{1F504} Retry"):O?C=V("return_home","Cancel mission","\u2715 Cancel mission"):p!=="returning"&&!k&&(c>0?C=V("clean-selected","Start selected rooms",`\u25B6 Start ${c} selected room${c!==1?"s":""}`):(C=V("start","Start full clean",Z?"\u25B6 Start anyway":"\u25B6 Start full clean"),e.mode!=="companion"&&r.hasSmartZones&&(C+=`<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${i}">
          \u{1F5FA} Rooms\u2026
        </button>`))),`
    <div class="rpc-header${q?" "+q:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${G}</span>
        <span class="rpc-robot-name">${X}</span>
        ${_e}
        ${ce}
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${p}">${x}</span>
        <span class="rpc-state-label">${B}</span>
      </div>
      ${U}
      ${ue}
      ${ae}
      ${oe}
      ${pe}
      ${Y}
      ${ye}
      ${ie}
      ${we}
      ${le}
      ${C?`<div class="rpc-actions">${C}</div>`:""}
    </div>
  `}function at(t,n){let e=[];return t.mode!=="companion"&&n.hasCoverageImage&&e.push({id:"map",icon:"\u{1F5FA}",label:"Map"}),e.push({id:"history",icon:"\u{1F4C5}",label:"History"}),e.push({id:"health",icon:"\u2764",label:"Health"}),e.push({id:"settings",icon:"\u2699",label:""}),e}function Ne(t,n){return t.default_tab?t.default_tab:t.mode!=="companion"&&n.hasCoverageImage?"map":"history"}function ot(t,n,e){let r=e;if(n.hasRobotHealthScore){let a=t.states[`sensor.${r}_robot_health_score`];if(a&&a.state!=="unknown"&&a.state!=="unavailable"){let s=parseFloat(a.state);if(!isNaN(s)&&s<60)return!0}}if(n.hasMaintenanceCalendar){let a=[`sensor.${r}_wheel_last_cleaned`,`sensor.${r}_contact_last_cleaned`,`sensor.${r}_bin_last_cleaned`],s=Date.now();for(let o of a){let i=t.states[o];if(!i||i.state==="unavailable"||i.state==="unknown")continue;let c=new Date(i.state).getTime();if(!isNaN(c)&&(s-c)/864e5>90)return!0}}if(n.hasRoomsOverdue){let a=t.states[`sensor.${r}_rooms_overdue`];if(a&&a.state!=="unknown"&&a.state!=="unavailable"){let s=parseFloat(a.state);if(!isNaN(s)&&s>0)return!0}}return!!De(t,n,e,"health")}function it(t,n,e){return De(t,n,e,"history")}function lt(t,n,e={}){return`
    <div class="rpc-tab-bar" role="tablist">
      ${t.map(r=>`
        <button class="rpc-tab-btn${r.id===n?" rpc-tab-btn--active":""}"
                role="tab" aria-selected="${r.id===n}"
                data-tab="${r.id}">
          <span class="rpc-tab-icon">${r.icon}</span>${r.label?`<span class="rpc-tab-label">${r.label}</span>`:""}
          ${e[r.id]?'<span class="rpc-tab-badge"></span>':""}
        </button>
      `).join("")}
    </div>
  `}var Pt=[["[data-action]","action"],["[data-room]","room"],["[data-pass]","pass"],["[data-bar]","bar"],["[data-tab]","tab"],["[data-household-back]","household-back"],["[data-room-poly]","room-overlay"],["[data-room-label]","room-overlay"],["[data-close]","close"],["[data-health-details-toggle]","health-details-toggle"],["[data-nav-details-toggle]","nav-details-toggle"],["[data-maint]","maint"],["[data-close-maint]","close-maint"],["[data-reset]","reset"],["[data-hold-action]","hold-action"],["[data-date]","heatmap-cell"],["[data-close-day]","close-day"],["[data-settings-toggle]","settings-toggle"],["[data-switch-entity]","switch-entity"],["[data-cycle-entity]","cycle-entity"],["[data-lifetime-toggle]","lifetime-toggle"],["[data-history-tab]","history-tab"],["[data-fav-entity]","fav-entity"],["[data-explain]","explain"],["[data-replay]","replay"],["[data-map]","map"]];function ct(t){if(!t)return null;for(let[n,e]of Pt){let r=t.closest(n);if(r)return{key:e,el:r}}return null}var Dt=[["[data-bar]","bar"],["[data-maint]","maint"]];function pt(t){if(!t)return null;for(let[n,e]of Dt){let r=t.closest(n);if(r)return{key:e,el:r}}return null}var Nt=["show_rooms","show_health","show_schedule","show_alerts","show_history","show_lifetime","show_dirt_events"];function dt(){return[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"mode",label:"Mode",selector:{select:{mode:"dropdown",options:[{value:"standalone",label:"Standalone \u2014 card owns the Map tab & room selection"},{value:"companion",label:"Companion \u2014 external map card handles spatial view"}]}}},{name:"default_tab",label:"Default tab on load",selector:{select:{mode:"dropdown",options:[{value:"map",label:"Map"},{value:"history",label:"History"},{value:"health",label:"Health"},{value:"settings",label:"Settings"}]}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"mission_map_rotate",label:"Mission map rotation (History \u2192 Map button)",selector:{select:{options:[{value:0,label:"No rotation"},{value:90,label:"90\xB0"},{value:180,label:"180\xB0"},{value:270,label:"270\xB0"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}},{name:"",type:"expandable",title:"Advanced \u2014 content visibility",schema:Nt.map(t=>({name:t,label:It[t],selector:{boolean:{}}}))}]}var It={show_rooms:"Room selector (SMART robots, Map tab)",show_health:"Health tab content",show_schedule:"Schedule & presence content",show_alerts:"Alert banners",show_history:"History tab content",show_lifetime:"Lifetime stats (History tab)",show_dirt_events:"Dirt events in day detail"};function ut(t,n){return!(t&&n&&t!==n)}var fe=280,Ie=12,mt=1e3;function Lt(t){let n=Array.isArray(t.coverage_mm)?t.coverage_mm:[],e=t.rooms&&typeof t.rooms=="object"?Object.entries(t.rooms):[],r=[],a=[];for(let f of n){if(!Array.isArray(f)||f.length<2)continue;let[M,v]=f;typeof M!="number"||typeof v!="number"||!isFinite(M)||!isFinite(v)||(r.push(M),a.push(v))}for(let[,f]of e)if(Array.isArray(f))for(let M of f){if(!Array.isArray(M)||M.length<2)continue;let[v,$]=M;typeof v!="number"||typeof $!="number"||!isFinite(v)||!isFinite($)||(r.push(v),a.push($))}if(r.length===0)return{points:[],rooms:[],empty:!0};let s=Math.min(...r),o=Math.max(...r),i=Math.min(...a),c=Math.max(...a),d=Math.max(o-s,mt),p=Math.max(c-i,mt),u=(fe-2*Ie)/Math.max(d,p),y=(f,M)=>[Ie+(f-s)*u,fe-Ie-(M-i)*u],k=100,g=t.point_area_m?.[0];typeof g=="number"&&isFinite(g)&&g>0&&(k=g*1e3);let b=Math.max(2,k*u/2),T=n.filter(f=>Array.isArray(f)&&f.length>=2&&typeof f[0]=="number"&&typeof f[1]=="number"&&isFinite(f[0])&&isFinite(f[1])).map(([f,M])=>{let[v,$]=y(f,M);return{x:v,y:$,r:b}}),R=e.map(([f,M])=>{if(!Array.isArray(M)||M.length<3)return null;let v=M.filter(_=>Array.isArray(_)&&_.length>=2&&typeof _[0]=="number"&&typeof _[1]=="number"&&isFinite(_[0])&&isFinite(_[1]));if(v.length<3)return null;let $=v.map(([_,E])=>y(_,E).join(",")).join(" ");return{name:f,points:$}}).filter(f=>f!==null);return{points:T,rooms:R,empty:T.length===0&&R.length===0}}function ht(t,n=0){let e=Lt(t);if(e.empty)return'<div class="rpc-map-panel rpc-explain-panel--muted">No coverage data to draw for this mission.</div>';let r=e.rooms.map(c=>`<polygon class="rpc-map-room" points="${h(c.points)}"><title>${h(c.name)}</title></polygon>`).join(""),a=e.points.map(c=>`<circle class="rpc-map-dot" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.r.toFixed(1)}"/>`).join(""),s=fe/2,o=`${r}${a}`,i=n!==0?`<g transform="rotate(${n} ${s} ${s})">${o}</g>`:o;return`
    <div class="rpc-map-panel">
      <svg class="rpc-map-svg" viewBox="0 0 ${fe} ${fe}" width="${fe}" height="${fe}" role="img" aria-label="Mission coverage map">
        ${i}
      </svg>
    </div>`}function gt(t){if(!Array.isArray(t)||t.length<3)return null;let[n,e,r]=t;if(!n?.vacuum||!n?.map||!e?.vacuum||!e?.map||!r?.vacuum||!r?.map||![n.vacuum.x,n.vacuum.y,n.map.x,n.map.y,e.vacuum.x,e.vacuum.y,e.map.x,e.map.y,r.vacuum.x,r.vacuum.y,r.map.x,r.map.y].every(l=>typeof l=="number"&&Number.isFinite(l)))return null;let s=e.vacuum.x-n.vacuum.x,o=r.vacuum.y-e.vacuum.y;if(s===0||o===0)return null;let i=(e.map.x-n.map.x)/s,c=n.map.x-i*n.vacuum.x,d=(r.map.y-e.map.y)/o,p=e.map.y-d*e.vacuum.y;return{toPx(l,u){return{x:i*l+c,y:d*u+p}}}}function Se(t,n,e){let{x:r,y:a}=t.toPx(n,e);return{left:(r/600*100).toFixed(1)+"%",top:(a/600*100).toFixed(1)+"%"}}function Re(t,n,e){let{x:r,y:a}=t.toPx(n,e);return{x:r/600*100,y:a/600*100}}var Ft={obstacle_or_blockage:"Obstacle or blockage",excessive_recharge:"Excessive recharging",dirt_spike:"Unusually dirty area",incomplete_coverage:"Incomplete coverage"};function Ot(t){return Ft[t]??t.replace(/_/g," ")}function Bt(t){if(!t.is_anomalous)return`<div class="rpc-explain-panel rpc-explain-panel--muted">Nothing statistically unusual vs. this robot's own history \u2014 the result code above is the whole story.</div>`;let n=t.anomaly_reason?Ot(t.anomaly_reason):"Anomalous mission",e=t.robot_lifted?'<div class="rpc-explain-lifted">Robot was picked up during this mission.</div>':"",r=t.recommended_action?`<div class="rpc-explain-rec">${h(t.recommended_action)}</div>`:"";return`
    <div class="rpc-explain-panel">
      <div class="rpc-explain-reason">${h(n)}</div>
      ${e}
      ${r}
    </div>`}function jt(t,n){return t.path.length?`<div class="rpc-replay-panel">${t.path.map(r=>`<span class="rpc-replay-step"><span class="rpc-replay-time">${new Date(r.time).toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}</span> ${h(r.room)}</span>`).join('<span class="rpc-trav-sep">\u2192</span>')}</div>`:'<div class="rpc-replay-panel rpc-explain-panel--muted">No room-level path recorded for this mission.</div>'}function Wt(t,n=0){return ht(t,n)}function vt(t,n){return n?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Vt(t){return t==="robot_learned"?"\u{1F6A7}":t==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}var Zt=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function qt(t){let n=t<12?"am":"pm";return`${t%12===0?12:t%12}${n}`}function Kt(t){if(t.dominant_weekday==null||t.dominant_hour==null)return"";let n=Zt[t.dominant_weekday]??"";return n?` \xB7 usually ${n} ~${qt(t.dominant_hour)}`:""}function Ut(t){let n=t.room_name?` \xB7 ${t.room_name}`:"";return t.source==="stuck_events"?`Stuck hotspot${t.stuck_count?` (${t.stuck_count}\xD7)`:""}${n}${Kt(t)}`:t.source==="robot_learned"?`Robot-detected obstacle${n}`:t.source==="keepout"?`Keep-out zone${n}`:"Hazard"}function Le(t,n,e,r,a,s){if(n.show_history===!1)return"";let o=r,i=n.history_days??28,c=n.area_unit??"auto",d=c==="m2"||c==="auto"&&s,{historyTab:p,hazards:l,mapSelectedRooms:u,suppressSubTabToggle:y,isMapContext:k}=a,g=t.states[`vacuum.${o}`]?.attributes??{},b=g.region_icons??{},T=g.last_cleaned_rooms??[],R=g.mission_destination??null,f=new Date().toLocaleDateString("en-CA"),M=a.openDay===f,v=t.states[`sensor.${o}_clean_streak`],$=t.states[`sensor.${o}_completion_rate_30d`],_=v?parseInt(v.state,10):0,E=$?parseInt($.state,10):NaN,H="",A=[];if(_>0&&A.push(`\u{1F525} ${_}-day streak`),isNaN(E)||A.push(`${E}% completion rate`),e.hasCleaningSpeedTrend){let I=t.states[`sensor.${o}_cleaning_performance`]?.attributes?.trend;I==="declining"?A.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):I==="improving"&&A.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}A.length&&(H=`<div class="rpc-history-summary">${A.map((L,I)=>I===0?L:`<span class="rpc-summary-sep">\xB7</span>${L}`).join("")}</div>`);let G=e.hasCoverageImage&&!y?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",X="";if(e.hasCoverageImage&&p==="coverage"){let I=t.states[`image.${o}_coverage_map`]?.attributes??{},W=I.x_min_mm,j=I.x_max_mm,O=I.y_min_mm,Y=I.y_max_mm,x=I.entity_picture,B=I.last_mission_end,q=W!=null&&j!=null&&O!=null&&Y!=null,ue=q?l.map(P=>{let re=Ge(P.x_mm,P.y_mm,W,j,O,Y),V=h(Ut(P)),C=Vt(P.source);return`<div class="rpc-hazard-pin rpc-pin-${P.source}" style="left:${re.left};top:${re.top}" title="${V}" aria-label="${V}">${C}</div>`}).join(""):"",U=!q&&x?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",te=B?`<div class="rpc-coverage-updated">Updated ${J(B,t.language)}</div>`:"",ae=l.some(P=>P.source==="stuck_events"),oe=l.some(P=>P.source==="robot_learned"),ye=l.some(P=>P.source==="keepout"),ie=[ae?"<span>\u{1F4CD}</span> Stuck hotspot":"",oe?"<span>\u{1F6A7}</span> Robot obstacle":"",ye?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" "),le=l.some(P=>P.source==="stuck_events"&&P.stuck_count!=null&&P.stuck_count>=3&&P.stuck_count<8&&P.dominant_weekday==null)?'<div class="rpc-coverage-note">Time patterns need \u22658 stuck events at one spot</div>':"",ce="",_e="",pe="",me="";if(e.hasAlignment){let P=t.states[`image.${o}_map`]?.attributes??{},re=P.rooms??{},V=P.calibration_points,C=Array.isArray(V)?gt(V):null;if(C){let Z=Object.values(re).map(S=>{if(!S.outline||S.outline.length<3)return"";let z=S.outline.map(([ne,he])=>{let xe=Re(C,ne,he);return`${xe.x.toFixed(1)},${xe.y.toFixed(1)}`}).join(" ");return`<polygon class="rpc-room-poly${u?.has(S.name)??!1?" rpc-room-poly--selected":""}"
            points="${z}" data-room-poly="${h(S.name)}" />`}).join(""),m=(()=>{let S=e.hasSmartZones?`select.${o}_smart_zone_select`:`select.${o}_zone_select`,z=t.states[S]?.attributes?.region_areas_m2;return z&&typeof z=="object"&&!Array.isArray(z)?z:{}})(),w={};if(e.hasRoomAccess){let S=t.states[`sensor.${o}_room_accessibility_scores`]?.attributes??{};for(let[z,F]of Object.entries(S))F&&typeof F=="object"&&typeof F.score=="number"&&(w[z]=F)}let D=S=>{if(S==null)return"";switch(S){case"obstacle_density":return"obstacle density";case"narrow_passages":return"narrow passages";case"coverage_gap":return"coverage gaps";default:return S}},N=Object.values(re).map(S=>{let z=Se(C,S.x,S.y),F=ve[S.icon]??"",ne=u?.has(S.name)??!1,he=m[S.name],xe=typeof he=="number"&&!isNaN(he)?` / ${he.toFixed(1)} m\xB2`:"",ge=w[S.name],Oe=ge?D(ge.limiting_factor):"",Ee=ge?`${S.name} \u2014 access ${Math.round(ge.score)}/100${Oe?` (limited by ${Oe})`:""}`:"",At=Ee?` title="${h(Ee)}" aria-label="${h(Ee)}"`:"";return`<div class="rpc-room-label${ne?" rpc-room-label--selected":""}"
            style="left:${z.left};top:${z.top}" data-room-label="${h(S.name)}"${At}>
            ${F?`${F} `:""}${h(S.name)}${h(xe)}
          </div>`}).join("");if(ce=`
          <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            ${Z}
          </svg>
          ${N}
        `,e.hasZoneOverlays){let z=(P.zones??[]).map(F=>{if(F.type==="observed"){let ne=Re(C,F.x,F.y);return`<circle class="rpc-zone-observed" cx="${ne.x.toFixed(1)}" cy="${ne.y.toFixed(1)}" r="2"><title>Robot-detected obstacle</title></circle>`}return F.type==="keepout"&&F.polygon.length>=3?`<polygon class="rpc-zone-keepout" points="${F.polygon.map(([he,xe])=>{let ge=Re(C,he,xe);return`${ge.x.toFixed(1)},${ge.y.toFixed(1)}`}).join(" ")}"><title>Keep-out zone</title></polygon>`:""}).join("");_e=z?`<svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">${z}</svg>`:""}e.hasDoorMarkers&&(pe=(P.door_markers??[]).map(z=>{let F=Se(C,z.cx,z.cy),ne=h(`${z.label} (seen ${z.mission_count}\xD7)`);return`<div class="rpc-door-marker" style="left:${F.left};top:${F.top}" title="${ne}" aria-label="${ne}">\u{1F6AA}</div>`}).join("")),e.hasFurnitureShadows&&(me=(P.furniture_candidates??[]).map(z=>{let F=Se(C,z.x_mm,z.y_mm);return`<div class="rpc-furniture-shadow" style="left:${F.left};top:${F.top}" title="Possible furniture change" aria-label="Possible furniture change"></div>`}).join(""))}}X=x?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${x}" alt="Coverage map" />
          ${ce}
          ${_e}
          ${pe}
          ${me}
          ${ue}
        </div>
        ${U}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${ie}
        </div>
        ${le}
        ${te}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let K="";a.loading&&!a.data?K=Qe(Math.ceil(i/7)):a.error?K=`<div class="rpc-history-error">${h(a.error)}</div>`:a.data&&(K=Ke(a.data,i,c,t.language,e.hasDirtDensity),a.data.length<i&&(K+=`<div class="rpc-history-partial">Showing ${a.data.length} of ${i} days \u2014 full history builds over time</div>`));let Ce="";if(e.hasProblemZone){let L=t.states[`sensor.${o}_problem_zone`],I=t.states[`sensor.${o}_stuck_count_30d`];if(L&&L.state!=="unknown"&&L.state!=="unavailable"){let W=I?parseInt(I.state,10):0;W>0&&(Ce=`<div class="rpc-problem-zone">\u26A0 ${h(L.state)} \u2014 stuck ${W}\xD7 in 30 days</div>`)}}let se="";if(a.openDay){let I=new Date(a.openDay+"T00:00:00").toLocaleDateString(t.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),W=a.dayMissions,j=a.openDaySummary,O="";if(W===null)O="";else if(j&&j.total===0)O='<div class="rpc-day-empty">No missions this day</div>';else if(W.length>0)O=W.map((x,B)=>{let q=x.result==="completed"||x.result==="stuck_and_resumed"?"success":x.result==="stuck"||x.result==="stuck_and_abandoned"||x.result==="blocked_timeout"?"failure":"caution",ue=q==="success"?"\u2713":q==="failure"?"\u2717":"\u26A0",U=q==="success"?"rpc-day-ok":q==="failure"?"rpc-day-err":"rpc-day-caution",te=new Date(x.started_at).toLocaleTimeString(t.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),ae=x.area_sqft!==null?vt(x.area_sqft,d):"\u2014",oe=x.zones?.map(C=>h(C)).join(" \xB7 ")??"",ye=n.show_dirt_events&&x.dirt_events!=null&&x.dirt_events>0?`${x.dirt_events} dirt event${x.dirt_events!==1?"s":""}`:"",ie=[oe,ye].filter(Boolean).join(" \xB7 "),we=x.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",le="";if(x.wifi_signal&&x.wifi_signal.length>0){let C=x.wifi_signal.length===5,Z=Ye(x.wifi_signal),m=Je(Z,Math.min(...Z));if(C){let w=Ue(x.wifi_signal);w!==null&&(le=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${w}% average during mission"><span aria-hidden="true">\u{1F4F6}</span>${m}<span>${w}% avg</span></div>`)}else{let w=Math.min(...Z);le=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${w}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${m}<span>${w}% min</span></div>`}}let ce="";if(M&&B===W.length-1&&T.length>0){let C=T.map(m=>{let w=b[m],D=w?ve[w]??"":"";return`<span class="rpc-trav-room">${D?D+"\xA0":""}${h(m)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),Z=R?`<div class="rpc-mission-dest-popover">\u2192 Final: ${h(R)}</div>`:"";ce=`<div class="rpc-traversal-row">${C}</div>${Z}`}let pe="";x.room_coverage&&Object.keys(x.room_coverage).length>0&&(pe=`<div class="rpc-room-coverage">${Object.entries(x.room_coverage).map(([Z,m])=>{let w=Math.round(m*100);return`<span class="${w>=80?"rpc-cov-green":w>=60?"rpc-cov-amber":"rpc-cov-red"}">${h(Z)} ${w}%</span>`}).join(" \xB7 ")}</div>`);let me="";x.alignment_confidence!=null&&x.alignment_confidence<.85&&(me=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(x.alignment_confidence*100)}%)</div>`);let P="";if(q!=="success"){let C=a.openExplain?.missionId===x.id?a.openExplain:null,Z=`<button class="rpc-explain-btn" data-explain="${h(x.id)}" aria-expanded="${!!C}">Why?</button>`,m="";C&&(C.error?m='<div class="rpc-explain-panel rpc-explain-panel--muted">Explanation not available for this mission.</div>':C.data===null?m='<div class="rpc-explain-panel rpc-explain-panel--muted">Analysing\u2026</div>':m=Bt(C.data)),P=`${Z}${m}`}let re="";if(x.n_mssn!=null){let C=a.openReplay?.nMssn===x.n_mssn?a.openReplay:null,Z=`<button class="rpc-explain-btn" data-replay="${x.n_mssn}" aria-expanded="${!!C}">Route</button>`,m="";C&&(C.error?m='<div class="rpc-replay-panel rpc-explain-panel--muted">Path not available for this mission.</div>':C.data===null?m='<div class="rpc-replay-panel rpc-explain-panel--muted">Loading\u2026</div>':m=jt(C.data,t.language)),re=`${Z}${m}`}let V="";if(x.n_mssn!=null){let C=a.openMissionMap?.recordId===x.id?a.openMissionMap:null,Z=`<button class="rpc-explain-btn" data-map="${h(x.id)}" aria-expanded="${!!C}">Map</button>`,m="";C&&(C.status==="absent"?m='<div class="rpc-map-panel rpc-explain-panel--muted">No coverage map for this mission.</div>':C.status==="error"?m=`<div class="rpc-map-panel rpc-explain-panel--muted">Couldn't load the map \u2014 try again.</div>`:C.data===null?m='<div class="rpc-map-panel rpc-explain-panel--muted">Loading\u2026</div>':m=Wt(C.data,n.mission_map_rotate??0)),V=`${Z}${m}`}return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${U}">${ue}</span>
            <span class="rpc-day-time">${te}</span>
            <span class="rpc-day-dur">${x.duration_min} min</span>
            <span class="rpc-day-area">${ae}</span>
            ${we}
            ${ie?`<div class="rpc-day-zones">${ie}</div>`:""}
            ${le}
            ${ce}
            ${pe}
            ${me}
            ${P}
            ${re}
            ${V}
          </div>`}).join("");else if(j&&j.total>0){let x=j.area_sqft!==null?vt(j.area_sqft,d):null;O=`
        <div class="rpc-day-aggregate">
          <div>${j.total} mission${j.total>1?"s":""} \xB7 ${h(j.result)}
            ${x?` \xB7 ${x} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let Y=j?.total??0;se=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${h(I)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${Y>0&&W&&W.length>0?`<div class="rpc-day-count">${Y} mission${Y>1?"s":""}</div>`:""}
        ${O}
      </div>
    `}let ee="";if(n.show_lifetime!==!1){let L=t.states[`sensor.${o}_lifetime_missions`],I=t.states[`sensor.${o}_cleaning_analytics_30d`],W=L?parseInt(L.state,10):NaN,j=(()=>{let U=I?.attributes?.time_h;return typeof U=="number"?U:NaN})(),O=I?parseFloat(I.state):NaN,Y=U=>{let te=t.states[U];return!te||te.state==="unknown"||te.state==="unavailable"?NaN:parseInt(te.state,10)},x=Y(`sensor.${o}_optical_dirt_detections`),B=Y(`sensor.${o}_piezo_dirt_detections`),q=Y(`sensor.${o}_scrubs_count`);if(!isNaN(W)||!isNaN(j)||!isNaN(O)||!isNaN(x)||!isNaN(B)||!isNaN(q)){let U=[isNaN(x)?"":`${x.toLocaleString()} optical`,isNaN(B)?"":`${B.toLocaleString()} piezo`,isNaN(q)?"":`${q.toLocaleString()} scrub events`].filter(Boolean),te=U.length?`<div class="rpc-lifetime-stats rpc-lifetime-dirt">
            <span class="rpc-lifetime-arrow">\u2192</span>
            <span>Dirt detect: ${U.join(" \xB7 ")}</span>
          </div>`:"",ae=a.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(W)?"":`<span>${W.toLocaleString()} missions</span>`}
          ${isNaN(O)?"":`<span>${O.toLocaleString()} m\xB2</span>`}
          ${isNaN(j)?"":`<span>${j.toLocaleString()} h (30 d)</span>`}
        </div>${te}`:"";ee=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${a.lifetimeExpanded}">
          Stats ${a.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${ae}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      ${k?"":`<div class="rpc-zone-header">LAST ${i} DAYS</div>`}
      ${k?"":H}
      ${G}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&e.hasCoverageImage?X:K}
      </div>
      ${Ce}
      ${se}
      ${k?"":ee}
    </div>
  `}function bt(t,n){return Math.min(100,Math.max(0,Math.round(t/n*100)))}function ft(t,n){return n==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function Yt(t,n){let e=n/90;if(!e)return"";let r=t/e;return r>1.2?"\u2191":r<.8?"\u2193":"\u2192"}function yt(t){let n=parseInt(t,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":h(t)}function _t(t){return t>=80?"var(--rpc-green)":t>=60?"var(--rpc-amber)":"var(--rpc-red)"}function Gt(t){return t>=80?"GOOD":t>=60?"FAIR":"NEEDS ATTENTION"}function Xt(t,n,e,r){if(!n.hasRobotHealthScore)return"";let a=t.states[`sensor.${e}_robot_health_score`];if(!a)return"";if(a.state==="unknown"||a.state==="unavailable")return`
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating\u2026 (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
        ${r?"Hide details \u25B2":"Show details \u25BC"}
      </button>
    `;let o=Math.round(parseFloat(a.state));if(isNaN(o))return"";let i=_t(o),c=Gt(o),d=a.attributes?.status_text,p=a.attributes?.recommendation,l=d?`<div class="rpc-health-plain-status">${h(d)}${p?`<div class="rpc-health-recommendation">${h(p)}</div>`:""}</div>`:"";return`
    <div class="rpc-health-score" aria-label="Robot health ${o} out of 100, ${c}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${i}">${o}</span>
      <span class="rpc-health-score-band" style="color:${i}">\u25CF ${c}</span>
      ${Jt(t,e)}
    </div>
    ${l}
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
      ${r?"Hide details \u25B2":"Show details \u25BC"}
    </button>
  `}function Jt(t,n){let e=t.states[`sensor.${n}_health_score_trend`];if(!e)return"";if(e.state==="improving"||e.state==="stable"||e.state==="declining"){let s={improving:{icon:"\u2197",colour:"var(--rpc-green, #4ade80)",label:"improving"},stable:{icon:"\u2192",colour:"var(--secondary-text-color)",label:"stable"},declining:{icon:"\u2198",colour:"#d97706",label:"declining"}}[e.state];return`<span class="rpc-health-trend" style="color:${s.colour}" aria-label="Health trend: ${s.label}">${s.icon} ${s.label}</span>`}let r=e.attributes?.days_until_ready;return typeof r=="number"&&r>0?`<span class="rpc-health-trend rpc-health-trend--calibrating">trend in ~${r}d</span>`:""}function Qt(t,n){let e=t.states[`sensor.${n}_consecutive_mission_anomalies`];if(!e)return"";let r=Number(e.state);return!Number.isFinite(r)||r<3?"":`
    <div class="rpc-anomaly-banner" role="alert">
      \u26A0 Last ${r} missions were anomalous \u2014 check brushes and filter
    </div>
  `}function er(t,n,e,r){if(!n.hasNavStats)return"";let a=l=>{let u=t.states[`sensor.${e}_${l}`];if(!u||u.state==="unknown"||u.state==="unavailable")return null;let y=Number(u.state);return Number.isFinite(y)?y:null},s=a("nav_quality"),o=a("nav_panics"),i=a("nav_landmark_quality"),c=a("nav_good_landmarks");if(s===null&&o===null&&i===null&&c===null)return"";let d=s!==null?`<span class="rpc-nav-score-value" style="color:${_t(s)}">${Math.round(s)}</span><span class="rpc-nav-score-max">/100</span>`:'<span class="rpc-nav-score-value rpc-nav-score--na">\u2014</span>',p=[];return o!==null&&p.push(`<div class="rpc-nav-factor" title="How often navigation failed and the robot had to recover">
        <span class="rpc-nav-factor-label">Panic events</span>
        <span class="rpc-nav-factor-value">${o}</span>
      </div>`),i!==null&&p.push(`<div class="rpc-nav-factor" title="Match-tracking quality of visual landmarks (higher is better)">
        <span class="rpc-nav-factor-label">Landmark quality</span>
        <span class="rpc-nav-factor-value">${i}</span>
      </div>`),c!==null&&p.push(`<div class="rpc-nav-factor" title="Number of reliable visual landmarks the robot is tracking">
        <span class="rpc-nav-factor-label">Good landmarks</span>
        <span class="rpc-nav-factor-value">${c}</span>
      </div>`),`
    <div class="rpc-nav-health">
      <div class="rpc-nav-header">
        <span class="rpc-nav-label">NAVIGATION</span>
        <span class="rpc-nav-score">${d}</span>
        <button class="rpc-nav-toggle" data-nav-details-toggle aria-expanded="${r}">
          ${r?"Hide \u25B2":"Details \u25BC"}
        </button>
      </div>
      ${r&&p.length>0?`<div class="rpc-nav-factors">${p.join("")}</div>`:""}
    </div>
  `}function tr(t,n,e,r){if(!n.hasMaintenanceCalendar)return"";let a=[{key:"wheel",label:"Wheels",entityId:`sensor.${e}_wheel_last_cleaned`,service:"roomba_plus.reset_wheel_cleaning"},{key:"contact",label:"Contacts",entityId:`sensor.${e}_contact_last_cleaned`,service:"roomba_plus.reset_contact_cleaning"},{key:"bin",label:"Bin",entityId:`sensor.${e}_bin_last_cleaned`,service:"roomba_plus.reset_bin_cleaning"}].filter(o=>!!t.states[o.entityId]);return a.length===0?"":`
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${a.map(o=>{let i=t.states[o.entityId],c=r.openMaintPopover===o.key,p=i.state!=="unavailable"&&i.state!=="unknown"?`Cleaned ${J(i.state,t.language)}`:"Never recorded";return`
      <div class="rpc-maint-row" data-maint="${o.key}" role="button" aria-expanded="${c}" tabindex="0"
           aria-label="${o.label} \u2014 ${p}">
        <span class="rpc-maint-label">${o.label}</span>
        <span class="rpc-maint-val">${p}</span>
      </div>
      ${c?`
        <div class="rpc-popover">
          <div class="rpc-popover-header">
            <span>${o.label}</span>
            <button class="rpc-popover-close" data-close-maint="${o.key}" aria-label="Close">\xD7</button>
          </div>
          <div class="rpc-popover-divider"></div>
          <div class="rpc-popover-sub">Reset via Developer Tools \u2192 Services:</div>
          <div class="rpc-maint-service">${o.service}</div>
        </div>
      `:""}
    `}).join("")}
  `}function rr(t,n){let e=p=>{let l=t.states[p];if(!l||l.state==="unknown"||l.state==="unavailable")return null;let u=parseFloat(l.state);return isNaN(u)?null:u},r=e(`sensor.${n}_dock_tank_level`),a=e(`sensor.${n}_dock_knockoffs`),s=e(`sensor.${n}_dock_charge_aborts`),o=e(`sensor.${n}_dock_contact_chatters`);if(r===null&&a===null&&s===null&&o===null)return"";let i=r!==null?`<div class="rpc-dock-tank">Tank level ${Math.round(r)}%</div>`:"",c=[a!==null?`${a.toLocaleString()} knockoffs`:"",s!==null?`${s.toLocaleString()} charge aborts`:"",o!==null?`${o.toLocaleString()} contact chatters`:""].filter(Boolean),d=c.length?`<div class="rpc-dock-counters">${c.join(" \xB7 ")} <span class="rpc-dock-lifetime-note">(lifetime)</span></div>`:"";return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-dock-health">
      <div class="rpc-dock-label">DOCK</div>
      ${i}
      ${d}
    </div>
  `}function nr(t,n,e,r){if(!n.hasRoomsOverdue)return"";let a=t.states[`sensor.${e}_rooms_overdue`];if(!a||a.state==="unknown"||a.state==="unavailable")return"";let s=a.attributes??{},o=s.rooms??{},i=Array.isArray(s.overdue_rooms)?s.overdue_rooms:[],c=Array.isArray(s.daily_suggested)?s.daily_suggested:[],d;i.length===0?d='<div class="rpc-rooms-overdue-row rpc-rooms-overdue-row--muted">All rooms in rhythm</div>':d=i.map(R=>{let f=o[R];if(!f)return"";let M=Math.round(f.days_since_last),v=f.expected_interval_days!=null?Math.round(f.expected_interval_days):null,$=v!=null?` (expected ~${v}d)`:"";return`<div class="rpc-rooms-overdue-row">${h(R)} \u2014 ${M}d since last clean${$}</div>`}).join("");let p=c.length>0?`<div class="rpc-rooms-overdue-daily">${c.map(h).join(", ")} could use daily cleaning</div>`:"",l=s.suggested_interval_days??{},u=Object.entries(l).filter(R=>typeof R[1]=="number"&&isFinite(R[1])).sort((R,f)=>R[1]-f[1]),y=u.length>0?`<div class="rpc-rooms-suggested">${u.map(([R,f])=>`<div class="rpc-rooms-suggested-row">${h(R)}: suggested every ${f.toFixed(1)}d</div>`).join("")}</div>`:"",k=r.resetting==="overdue-clean",g=i.length>0?`
    <button class="rpc-btn rpc-btn-secondary rpc-rooms-overdue-btn${k?" rpc-btn-loading":""}"
            data-reset="overdue-clean" data-service="clean_overdue_rooms"
            ${k?"disabled":""}>
      ${k?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Clean overdue"}
    </button>
    ${r.resetError==="overdue-clean"?`<div class="rpc-send-error">Couldn't start \u2014 try again</div>`:""}
  `:"",b=r.resetting==="auto-clean-dirty",T=`
    <button class="rpc-btn rpc-btn-secondary rpc-rooms-overdue-btn${b?" rpc-btn-loading":""}"
            data-reset="auto-clean-dirty" data-service="auto_clean_dirty_rooms"
            ${b?"disabled":""}>
      ${b?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Auto-clean dirty rooms"}
    </button>
    ${r.resetError==="auto-clean-dirty"?`<div class="rpc-send-error">Couldn't start \u2014 try again</div>`:""}
  `;return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-rooms-overdue">
      <div class="rpc-dock-label">ROOMS</div>
      ${d}
      ${p}
      ${y}
      ${g}
      ${T}
    </div>
  `}function sr(t,n,e){if(!n.hasDirtCorrelation)return"";let r=t.states[`sensor.${e}_dirt_weather_correlation`];if(!r||r.state==="unavailable")return"";let a=r.attributes??{},s=a.by_entity??{},o=a.strongest_entity??null,i=p=>t.states[p]?.attributes?.friendly_name??p,c,d=o?s[o]:void 0;if(o&&d?.r!=null)c=`<div class="rpc-dirt-corr-row">Strongest link: ${h(i(o))} (r = ${d.r.toFixed(2)})</div>`;else{let p=Object.entries(s);p.length===0?c='<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">Collecting data\u2026</div>':c=p.map(([l,u])=>{let y=typeof u?.n=="number"?u.n:0;return`<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">${h(i(l))}: ${y}/30 missions</div>`}).join("")}return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-dirt-corr">
      <div class="rpc-dock-label">DIRT CORRELATION</div>
      ${c}
    </div>
  `}function xt(t,n,e,r,a){if(n.show_health===!1)return"";let s=r,o=[];t.states[`sensor.${s}_filter_remaining_hours`]&&o.push({key:"filter",label:"Filter",sensorId:`sensor.${s}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${s}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${s}_brush_remaining_hours`]&&o.push({key:"brush",label:"Brush",sensorId:`sensor.${s}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${s}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${s}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${s}_pad_days_until_due`]&&o.push({key:"pad",label:"Pad",sensorId:`sensor.${s}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:e.hasWearRate?`sensor.${s}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${s}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${s}_mop_tank_level`]&&o.push({key:"tank",label:"Tank",sensorId:`sensor.${s}_mop_tank_level`,thresholdAttr:null,type:"tank"});let i=t.states[`sensor.${s}_battery`]?`sensor.${s}_battery`:null,c=i?void 0:t.states[`vacuum.${s}`]?.attributes?.battery_level;(i||c!==void 0)&&o.push({key:"battery",label:"Battery",sensorId:i??"",thresholdAttr:null,type:"battery",rawPct:c}),e.hasCleanBase&&t.states[`sensor.${s}_clean_base_status`]&&o.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${s}_clean_base_status`,thresholdAttr:null,type:"cleanbase"});let d=Qt(t,s),p=er(t,e,s,a.navDetailsExpanded),l="";{let v=t.states[`vacuum.${s}`],$=!!v&&(v.state==="error"||!!v.attributes?.error_code),_=t.states[`sensor.${s}_last_error_code`];if(!$&&_&&_.state!=="0"&&_.state!==""&&_.state!=="unknown"&&_.state!=="unavailable"){let E=h(_.attributes.label??`Error ${_.state}`),H=t.states[`sensor.${s}_last_error_at`]?.state,A=H&&H!=="unknown"&&H!=="unavailable"?J(H,t.language):"";l=`
        <div class="rpc-last-error-info">Last error: ${E}${A?` \xB7 ${h(A)} (resolved)`:" (resolved)"}</div>
      `}}let u=rr(t,s),y=nr(t,e,s,a),k=sr(t,e,s);if(o.length===0&&!e.hasRobotHealthScore&&!e.hasMaintenanceCalendar&&!d&&!p&&!e.hasBatteryRetention&&!e.hasCoveragePct&&!l&&!u&&!y&&!k)return"";let g=o.map(v=>ar(v,t,s,a)).join(""),b="";if(e.hasBatteryRetention){let v=t.states[`sensor.${s}_battery_capacity_retention`];if(v&&v.state!=="unavailable"&&v.state!=="unknown"){let $=Math.round(parseFloat(v.state));if(!isNaN($)){let _=$>85?"var(--rpc-green)":$>70?"var(--rpc-amber)":"var(--rpc-red)",E=t.states[`sensor.${s}_battery_cycles`],H=E?parseInt(E.state,10):NaN,A=isNaN(H)?"":`${H} charge cycle${H!==1?"s":""}`,G="";if(e.hasBatteryEol){let ee=t.states[`sensor.${s}_estimated_battery_eol`];if(ee&&ee.state!=="unavailable"&&ee.state!=="unknown"){let L=parseInt(ee.state,10);isNaN(L)||(G=L>0?`<div class="rpc-retention-eol">Battery life: ~${L} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let X=a.openPopover==="retention",K=a.resetting==="retention",se=X?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${$}% of original capacity</div>
              ${A?`<div class="rpc-popover-sub">${A}</div>`:""}
              ${G}
            </div>
            <button class="rpc-btn rpc-btn-secondary${K?" rpc-btn-loading":""}"
                    data-reset="retention" data-service="reset_battery"
                    ${K?"disabled":""}>
              ${K?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
            </button>
            ${a.resetError==="retention"?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
          </div>`:"";b=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${X}" tabindex="0"
               aria-label="Bat. Health \u2014 ${$}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${$}%;background:${_}"></div></div>
            <span class="rpc-bar-pct" style="color:${_}">${$}%</span>
            <span class="rpc-bar-hours"></span>
          </div>
          ${se}`}}}let T="";if(e.hasCoveragePct){let v=t.states[`sensor.${s}_recent_coverage_pct`];if(v&&v.state!=="unavailable"&&v.state!=="unknown"){let $=t.states[`sensor.${s}_missions_last_30d`],_=$?parseInt($.state,10):NaN;if(isNaN(_)||_<10)T=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let E=Math.min(100,Math.round(parseFloat(v.state)));if(!isNaN(E)){let H=E>=85?"var(--rpc-green)":E>=65?"var(--rpc-amber)":"var(--rpc-red)",A=a.openPopover==="coverage",G=isNaN(_)?"":`Based on ${_} mission${_!==1?"s":""} in the last 30 days.`,X=A?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${E}% of floor area covered on the last mission.</div>
                ${G?`<div class="rpc-popover-sub">${G}</div>`:""}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>`:"";T=`
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${A}" tabindex="0"
                 aria-label="Coverage ${E}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${E}%;background:${H}"></div></div>
              <span class="rpc-bar-pct" style="color:${H}">${E}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${X}`}}}}let R=b||T?`<div class="rpc-health-battery-sep"></div>${b}${T}`:"",f="";if(e.hasEnergyConsumption){let v=t.states[`sensor.${s}_total_energy_consumed`];if(v&&v.state!=="unavailable"&&v.state!=="unknown"){let $=parseFloat(v.state);if(!isNaN($)){let _=t.states[`sensor.${s}_battery_cycles`],E=_?parseInt(_.state,10):NaN,H=a.openPopover==="energy",A=H?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${$.toFixed(1)} kWh used${isNaN(E)?"":` over ${E} charge cycles`}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>`:"";f=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${H}" tabindex="0"
               aria-label="Lifetime energy ~${$.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${$.toFixed(1)} kWh lifetime</span>
          </div>
          ${A}`}}}let M="";if(e.isMop){let v=t.states[`sensor.${s}_mop_pad`],$=e.hasMopBehavior?t.states[`sensor.${s}_mop_behavior`]:null,_=[];v&&v.state!=="unknown"&&v.state!=="unavailable"&&_.push(h(v.state)),$&&$.state!=="unknown"&&$.state!=="unavailable"&&_.push(`${h($.state)} intensity`),_.length&&(M=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${_.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${d}
      ${l}
      ${Xt(t,e,s,a.healthDetailsExpanded)}
      ${e.hasRobotHealthScore&&!a.healthDetailsExpanded?"":`
        ${g}
        ${R}
        ${f}
        ${M}
        ${u}
        ${y}
        ${k}
      `}
      ${tr(t,e,s,a)}
      ${p}
    </div>
  `}function ar(t,n,e,r){let a=r.openPopover===t.key;if(t.type==="cleanbase"){let u=n.states[t.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${a}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${yt(u.state)}</span>
      </div>
      ${a?ir(t.label,u.state):""}
    `:""}let s=0,o="",i="",c=null;if(t.rawPct!==void 0)s=Math.min(100,Math.max(0,t.rawPct)),o=`${Math.round(s)}%`;else{let u=n.states[t.sensorId];if(!u)return"";let y=parseFloat(u.state);if(isNaN(y))return"";if(t.type==="tank"||t.type==="battery")s=Math.min(100,Math.max(0,y)),o=`${Math.round(s)}%`;else{if(c=t.thresholdAttr?u.attributes[t.thresholdAttr]:null,!c)return"";s=bt(y,c),o=`${s}%`,i=`${Math.round(y)}h`}}let d=ft(s,t.type),p="";if(t.wearSensorId&&c){let u=n.states[t.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=Yt(parseFloat(u.state),c))}let l=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:n.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${a}" tabindex="0"
         aria-label="${t.label} \u2014 ${o}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${s}%;background:${d}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${d}">${o}</span>
      ${i?`<span class="rpc-bar-hours">${i}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${d}">${p}</span>`:""}
    </div>
    ${a&&l?or(t,l,c,n,r):""}
  `}function or(t,n,e,r,a){let s=parseFloat(n.state),o=e?bt(s,e):Math.min(100,Math.max(0,s)),i=ft(o,t.type),c=a.resetting===t.key,d=t.lastReplacedId?r.states[t.lastReplacedId]:null,p="";d&&d.state!=="unavailable"&&d.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(d.state).toLocaleDateString(r.language)} (${J(d.state,r.language)})</span>
      </div>`);let l="";if(t.wearSensorId&&!a.legendShown){let y=r.states[t.wearSensorId];y&&y.state!=="unknown"&&y.state!=="unavailable"&&(l=`
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>\u2191 wearing faster than normal</span>
          <span>\u2192 wearing at normal rate</span>
          <span>\u2193 wearing slower than normal</span>
        </div>`)}return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${h(t.label)}</span>
        <button class="rpc-popover-close" data-close="${t.key}" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${p}
      ${e?`<div class="rpc-popover-row"><span>Threshold</span><span>${e} ${t.unit??"h"}</span></div>`:""}
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(s)} ${t.unit??"h"} (${o}%)</span></div>`:""}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${o}%;background:${i}"></div>
      </div>
      ${l}
      ${t.resetService?`
        <button class="rpc-btn rpc-btn-secondary${c?" rpc-btn-loading":""}"
                data-reset="${t.key}" data-service="${t.resetService}"
                ${c?"disabled":""}>
          ${c?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
        </button>
        ${a.resetError===t.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function ir(t,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${h(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${yt(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function $t(t,n){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let e=new Date(t);return e.toLocaleDateString(n,{weekday:"short"})+" "+e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return h(t)}}function lr(t,n){if(!t||t==="unavailable"||t==="unknown")return"";try{let e=new Date(t);if(isNaN(e.getTime()))return"";let r=e.toLocaleDateString(n,{weekday:"short"}),a=e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${r} ~${a}`}catch{return""}}function wt(t,n,e,r,a){if(n.show_schedule===!1)return"";let s=r,o=t.states[`sensor.${s}_next_clean`],i=t.states[`binary_sensor.${s}_schedule_hold_active`],c=t.states[`sensor.${s}_presence_clean_opportunities_7d`],d=t.states[`sensor.${s}_presence_clean_utilisation_7d`],p=t.states[`sensor.${s}_next_likely_clean_window`],l=!!c&&!!d&&c.state!=="unknown"&&c.state!=="unavailable"&&d.state!=="unknown"&&d.state!=="unavailable",u=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!o&&!i&&!l&&!u&&!e.hasOptimalWindow)return"";let y="";if(i){let f=i.state==="on",v=i.attributes.source==="presence_manager",$="rpc-badge-green",_="Schedule active",E="";f&&(v?($="rpc-badge-blue",_="Away hold",E="\u{1F3C3}"):($="rpc-badge-amber",_="Hold active",E="\u{1F512}")),y=`
      <button class="rpc-hold-badge ${$}"
              data-hold-action="${v?"tooltip":"toggle"}"
              aria-label="${h(_)}">
        ${a.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${E} ${_}`}
      </button>
      ${a.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let k="";if(u){let f=lr(p.state,t.language);f&&(k=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${f}</span>
        </div>
      `)}let g="";if(e.hasOptimalWindow){let f=t.states[`sensor.${s}_optimal_clean_window`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let M=$t(f.state,t.language);M&&M!=="No schedule set"&&(g=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${M}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let b="",T=n.presence_entities??[];if(T.length>0){let f=T.map(M=>{let v=t.states[M];if(!v)return"";let $=v.state==="home",_=v.attributes.friendly_name??M,E=h(_.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${$?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${E}
        <span class="rpc-presence-label">${$?"home":"away"}</span>
      </span>`}).join("");f&&(b=`<div class="rpc-presence-row">${f}</div>`)}let R="";if(l){let f=parseInt(c.state,10),M=parseInt(d.state,10);if(!isNaN(f)&&!isNaN(M)){let v=d.attributes.cleans_7d,$=v??Math.round(f*M/100),_=`${f} opportunit${f!==1?"ies":"y"} this week`;R=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${$} clean${$!==1?"s":""}`} \xB7 ${_}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${o?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${$t(o.state,t.language)}</span>
            </div>`:""}
          ${k}
          ${g}
        </div>
        ${y}
      </div>
      ${b}
      ${R}
    </div>
  `}function cr(t,n){let e=`button.${n}_fav_`;return Object.keys(t.states).filter(r=>r.startsWith(e)).sort()}function pr(t,n,e){let r=t.states[n]?.attributes?.friendly_name?.trim();if(r){let s=t.states[`vacuum.${e}`]?.attributes?.friendly_name?.trim();return s&&r.startsWith(s+" ")?r.slice(s.length+1):r}return n.replace(`button.${e}_fav_`,"").split("_").map(s=>s&&s[0].toUpperCase()+s.slice(1)).join(" ")}function kt(t,n,e){let r=cr(t,e);return r.length===0?"":`
    <div class="rpc-settings-divider"></div>
    <div class="rpc-fav-section">
      <div class="rpc-fav-label">Favourites</div>
      <div class="rpc-fav-row">${r.map(s=>{let o=h(pr(t,s,e));return`<button class="rpc-fav-btn" data-fav-entity="${h(s)}" aria-label="${o}">\u2605 ${o}</button>`}).join("")}</div>
    </div>
  `}function Ct(t,n){let{hass:e,config:r,caps:a,robotName:s,isMetric:o}=n;switch(t){case"map":return Le(e,r,a,s,{data:n.missionData,loading:n.historyLoading,error:n.historyError,openDay:n.openDay,dayMissions:n.dayMissions,openDaySummary:n.openDaySummary,openExplain:n.openExplain,openReplay:n.openReplay,openMissionMap:n.openMissionMap,lifetimeExpanded:n.lifetimeExpanded,historyTab:"coverage",hazards:n.hazards,mapSelectedRooms:n.selectedRooms,suppressSubTabToggle:!0,isMapContext:!0},o);case"history":return Le(e,r,a,s,{data:n.missionData,loading:n.historyLoading,error:n.historyError,openDay:n.openDay,dayMissions:n.dayMissions,openDaySummary:n.openDaySummary,openExplain:n.openExplain,openReplay:n.openReplay,openMissionMap:n.openMissionMap,lifetimeExpanded:n.lifetimeExpanded,historyTab:r.mode==="companion"?n.historyTab:"calendar",hazards:n.hazards,suppressSubTabToggle:r.mode!=="companion"},o);case"health":return`
          ${n.alertZoneHtml}
          ${xt(e,r,a,s,{openPopover:n.openPopover,resetting:n.resetting,resetError:n.resetError,legendShown:n.legendShown,healthDetailsExpanded:n.healthDetailsExpanded,openMaintPopover:n.openMaintPopover,navDetailsExpanded:n.navDetailsExpanded})}
        `;case"settings":return`
          ${wt(e,r,a,s,{holdTooltipVisible:n.holdTooltipVisible,holdToggling:n.holdToggling})}
          <div class="rpc-settings-divider"></div>
          ${He(e,r,s,n.settingsPanelOpen)}
          ${r.mode!=="companion"?Me({hass:e,config:r,caps:a,robotName:s,selectedRooms:n.selectedRooms,passes:n.passes,isSending:n.isSendingClean,sendError:n.sendError,settingsPanelOpen:n.settingsPanelOpen,includeSettingsPanel:!1}):""}
          ${n.maintenanceLinksHtml}
          ${kt(e,r,s)}
        `;default:return""}}function Mt(t){return dr.has(t)}var dr=new Set(["room","tab","household-back","room-overlay","close","health-details-toggle","nav-details-toggle","maint","close-maint","close-day","settings-toggle","lifetime-toggle","history-tab","bar","heatmap-cell"]);function St(t,n,e={}){switch(t){case"room":{let r=e.room;return n.selectedRooms.has(r)?n.selectedRooms.delete(r):n.selectedRooms.add(r),{selectedRooms:n.selectedRooms}}case"room-overlay":{let r=e.room;return r?(n.selectedRooms.has(r)?n.selectedRooms.delete(r):n.selectedRooms.add(r),{selectedRooms:n.selectedRooms}):{}}case"tab":{let r=e.tab??null;return r===n.activeTab?{}:{activeTab:r}}case"household-back":return{viewMode:"robot"};case"close":return{openPopover:null};case"health-details-toggle":return{healthDetailsExpanded:!n.healthDetailsExpanded};case"nav-details-toggle":return{navDetailsExpanded:!n.navDetailsExpanded};case"maint":{let r=e.maint;return{openMaintPopover:n.openMaintPopover===r?null:r}}case"close-maint":return{openMaintPopover:null};case"close-day":return{openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null};case"settings-toggle":return{settingsPanelOpen:!n.settingsPanelOpen};case"lifetime-toggle":return{lifetimeExpanded:!n.lifetimeExpanded};case"history-tab":return{historyTab:e.historyTab,openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null};case"bar":{let r=e.bar;return{openPopover:n.openPopover===r?null:r,resetError:null}}case"heatmap-cell":{let r=e.date;return n.openDay===r?{openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null}:{openDay:r,openDaySummary:e.daySummaryForDate??null,dayMissions:e.dayMissionsForDate??null,openExplain:null,openReplay:null,openMissionMap:null}}}}var ur={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"],stop:["vacuum","stop"],retry:["vacuum","start"]};function Rt(t){if(t==="clean-selected")return{kind:"clean-selected"};if(t==="repeat-last")return{kind:"repeat-last"};if(t==="toggle-room-picker")return{kind:"toggle-room-picker"};let n=ur[t];if(!n)return{kind:"noop"};let[e,r]=n;return{kind:"vacuum",domain:e,service:r,action:t,pulse:t==="locate"}}var Et=`
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
  /* A1 \u2014 navigation health detail */
  .rpc-nav-health { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }
  .rpc-nav-header { display: flex; align-items: center; gap: 8px; }
  .rpc-nav-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--secondary-text-color); }
  .rpc-nav-score { display: flex; align-items: baseline; gap: 1px; }
  .rpc-nav-score-value { font-size: 1.1rem; font-weight: 700; line-height: 1; }
  .rpc-nav-score-max { font-size: 0.7rem; color: var(--secondary-text-color); }
  .rpc-nav-score--na { color: var(--secondary-text-color); }
  .rpc-nav-toggle {
    margin-left: auto; font-size: 0.72rem; background: none; border: none;
    color: var(--primary-color); cursor: pointer; padding: 2px 4px;
  }
  .rpc-nav-factors { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .rpc-nav-factor { display: flex; justify-content: space-between; font-size: 0.8rem; }
  .rpc-nav-factor-label { color: var(--secondary-text-color); }
  .rpc-nav-factor-value { font-weight: 600; font-variant-numeric: tabular-nums; }
  .rpc-health-score-band  { font-size: 0.75rem; font-weight: 600; }
  /* v2.2.0 F2/F3 \u2014 plain status + trend */
  .rpc-health-trend { font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
  .rpc-health-trend--calibrating { color: var(--secondary-text-color); font-weight: 400; font-style: italic; }
  .rpc-health-plain-status { font-size: 0.82rem; margin: 2px 0 6px; }
  .rpc-health-recommendation { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 1px; }
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
    padding: 4px 2px 0; font-size: 0.8rem;
  }
  .rpc-maint-link-label   { color: var(--primary-text-color); }
  .rpc-maint-link-service {
    font-family: monospace; font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
  }
  /* v2.0.1: per-row "last reset" line, mirroring the Health tab's
     maintenance calendar rows so all four rows (wheel/contact/bin/battery)
     show consistent recency information instead of only three of them. */
  .rpc-maint-link-lastreset {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    padding: 0 2px 8px;
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
  .rpc-day-ok      { color: var(--rpc-green); }
  .rpc-day-caution { color: var(--rpc-amber); }
  .rpc-day-err     { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  /* v2.2.0 F1 \u2014 Why? explanation */
  .rpc-explain-btn { background: none; border: 1px solid var(--divider-color, #e5e7eb); border-radius: 10px;
    color: var(--secondary-text-color); font-size: 0.72rem; padding: 1px 8px; cursor: pointer; }
  .rpc-explain-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
  .rpc-explain-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; }
  .rpc-explain-panel--muted { color: var(--secondary-text-color); }
  .rpc-explain-reason { font-weight: 600; }
  .rpc-explain-lifted { color: var(--secondary-text-color); margin-top: 2px; }
  .rpc-explain-rec { color: var(--secondary-text-color); margin-top: 2px; }
  /* v2.2.0 F4 \u2014 path replay */
  .rpc-replay-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; line-height: 1.7; }
  .rpc-replay-step { white-space: nowrap; }
  .rpc-replay-time { color: var(--secondary-text-color); font-variant-numeric: tabular-nums; margin-right: 3px; }
  /* v2.3.0 MISSION-MAP \u2014 coverage replay. Button reuses .rpc-explain-btn styling
     (same visual family as Why?/Route) via a shared class on the element. */
  .rpc-map-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; }
  .rpc-map-svg { display: block; background: var(--rpc-map-bg, #fafafa); border-radius: 6px; }
  .rpc-map-room { fill: none; stroke: var(--divider-color, #d1d5db); stroke-width: 1.5; }
  .rpc-map-dot { fill: var(--rpc-map-dot-colour, #2d9c4f); fill-opacity: 0.55; stroke: none; }
  /* v2.2.0 A2/A3 */
  .rpc-lifetime-dirt { margin-top: 2px; }
  .rpc-dock-health { font-size: 0.82rem; }
  .rpc-dock-label { font-size: 0.7rem; font-weight: 700; letter-spacing: .06em; color: var(--secondary-text-color); margin-bottom: 2px; }
  .rpc-dock-tank { margin-bottom: 2px; }
  .rpc-dock-counters { color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-dock-lifetime-note { opacity: .7; }
  /* v2.3.0 \u2014 Rooms-Overdue widget */
  .rpc-rooms-overdue { font-size: 0.82rem; }
  .rpc-rooms-overdue-row { margin-bottom: 2px; }
  .rpc-rooms-overdue-row--muted { color: var(--secondary-text-color); }
  .rpc-rooms-overdue-daily { color: var(--secondary-text-color); font-size: 0.78rem; margin-top: 2px; }
  /* v2.3.0 \u2014 Dirt correlation widget */
  .rpc-dirt-corr { font-size: 0.82rem; }
  .rpc-dirt-corr-row { margin-bottom: 2px; }
  .rpc-dirt-corr-row--muted { color: var(--secondary-text-color); font-size: 0.78rem; }
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
  /* v2.2.0 B1 \u2014 resolved-error info line: informational, deliberately unalarming */
  .rpc-last-error-info { font-size: 0.78rem; color: var(--secondary-text-color); margin: 4px 0 8px; }

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
  /* A3 \u2014 Favourites row */
  .rpc-fav-section { margin-top: 8px; }
  .rpc-fav-label {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; color: var(--secondary-text-color); margin: 6px 0 6px;
  }
  .rpc-fav-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .rpc-fav-btn {
    font-size: 0.8rem; padding: 6px 12px; border-radius: 16px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.12));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color); cursor: pointer;
  }
  .rpc-fav-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
  .rpc-fav-btn:active { transform: scale(0.97); }
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
  /* v2.3.0 ZONE-OVERLAY / F24 */
  .rpc-zone-observed {
    fill: var(--rpc-amber, #d97706); fill-opacity: 0.5; stroke: none;
  }
  .rpc-zone-keepout {
    fill: var(--rpc-red, #dc2626); fill-opacity: 0.12;
    stroke: var(--rpc-red, #dc2626); stroke-opacity: 0.6; stroke-width: 0.4;
    stroke-dasharray: 2 1;
  }
  .rpc-door-marker {
    position: absolute; transform: translate(-50%, -50%);
    font-size: 0.85rem; pointer-events: none;
  }
  .rpc-furniture-shadow {
    position: absolute; transform: translate(-50%, -50%);
    width: 10px; height: 10px; border-radius: 2px;
    background: var(--secondary-text-color); opacity: 0.35;
    pointer-events: none;
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
  /* v2.1.0 A4 \u2014 current-room line */
  .rpc-current-room  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  /* v2.1.0 A1 \u2014 connectivity indicator (only rendered when degraded) */
  .rpc-connectivity-degraded {
    font-size: 0.68rem; font-weight: 600; color: var(--rpc-amber);
    border: 1px solid var(--rpc-amber); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }
  /* v2.1.0 A2 \u2014 firmware badge (24h after a firmware change) */
  .rpc-firmware-badge {
    font-size: 0.68rem; font-weight: 600;
    color: var(--rpc-green, #4caf50);
    border: 1px solid var(--rpc-green, #4caf50); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }

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
`,Fe=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.missionEventUnsub=null;this.missionEventSubscribing=!1;this.activeTab=null;this.roomPickerOpen=!1;this.viewMode="robot";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.healthDetailsExpanded=!1;this.navDetailsExpanded=!1;this.openMaintPopover=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.openExplain=null;this.openReplay=null;this.openMissionMap=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let a=!1;this.openPopover!==null&&(this.openPopover=null,a=!0),this.openMaintPopover!==null&&(this.openMaintPopover=null,a=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.openExplain=null,this.openReplay=null,this.openMissionMap=null,a=!0),a&&this.render()}};this.handleDelegatedClick=e=>{let r=e.target,a=ct(r);a&&(e.stopPropagation(),this.dispatchClick(a.key,a.el))};this.handleDelegatedChange=e=>{let r=e.target?.closest("[data-robot-select]");if(!r)return;e.stopPropagation();let a=r.value;a==="__household__"?(this.viewMode="household",this.render()):(this.viewMode="robot",this.switchRobot(a))};this.handleDelegatedKeydown=e=>{let r=e;if(r.key!=="Enter"&&r.key!==" ")return;let a=pt(e.target);a&&(e.preventDefault(),e.stopPropagation(),this.dispatchClick(a.key,a.el))};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick),this.root.addEventListener("click",this.handleDelegatedClick),this.root.addEventListener("change",this.handleDelegatedChange),this.root.addEventListener("keydown",this.handleDelegatedKeydown)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),this.root.removeEventListener("click",this.handleDelegatedClick),this.root.removeEventListener("change",this.handleDelegatedChange),this.root.removeEventListener("keydown",this.handleDelegatedKeydown),this.missionEventUnsub&&(this.missionEventUnsub().catch(()=>{}),this.missionEventUnsub=null),this.missionEventSubscribing=!1,this.clearAllTimers()}clearAllTimers(){[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)}),this.locateTimer=this.actionResetTimer=this.cleanTimeoutTimer=null,this.holdTooltipTimer=this.alertCollapseTimer=null}setConfig(e){let r=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!r[0])throw new Error("roomba-plus-card: entity is required");let a=this.activeRobot,s=r.includes(a)?a:r[0],o=s!==a;this.config=e,this.activeRobot=s,this.robotName=s.replace("vacuum.",""),o&&this.resetRobotState(),this.root.innerHTML=`<style>${Et}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let r=this.relevantEntityIds(),a=!this._hass||r.some(d=>e.states[d]?.state!==this._hass.states[d]?.state||e.states[d]?.last_changed!==this._hass.states[d]?.last_changed),s=this._hass;this._hass=e;let o=e.states[`select.${this.robotName}_cleaning_passes`];o&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=je[o.state]??"Auto");let i=`binary_sensor.${this.robotName}_mission_active`,c=e.states[i]?.state??"";if(c)this.prevMissionActive==="on"&&c==="off"&&this.loadHistory(),this.prevMissionActive=c;else{let d=e.states[this.activeRobot]?.state??"";this.prevVacuumState==="cleaning"&&d==="docked"&&this.loadHistory(),this.prevVacuumState=d}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new ke(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),this.maybeSubscribeMissionEvents(),(!s||a)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.activeRobot,`sensor.${e}_last_error_code`,`sensor.${e}_last_error_zone`,`sensor.${e}_last_error_at`,`sensor.${e}_health_score_trend`,`binary_sensor.${e}_layout_change_detected`,`sensor.${e}_optical_dirt_detections`,`sensor.${e}_piezo_dirt_detections`,`sensor.${e}_scrubs_count`,`sensor.${e}_dock_tank_level`,`sensor.${e}_dock_knockoffs`,`sensor.${e}_dock_charge_aborts`,`sensor.${e}_dock_contact_chatters`,`sensor.${e}_rooms_overdue`,`sensor.${e}_dirt_weather_correlation`,`sensor.${e}_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`sensor.${e}_readiness`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_pad`,`sensor.${e}_mop_tank_level`,`sensor.${e}_mop_behavior`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_nav_panics`,`sensor.${e}_nav_landmark_quality`,`sensor.${e}_nav_good_landmarks`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_cleaning_analytics_30d`,`sensor.${e}_battery_capacity_retention`,`sensor.${e}_estimated_battery_eol`,`sensor.${e}_wifi_health`,`sensor.${e}_recent_coverage_pct`,`sensor.${e}_missions_last_30d`,`sensor.${e}_average_mission_time`,`sensor.${e}_cleaning_performance`,`binary_sensor.${e}_consecutive_clean_skips`,`sensor.${e}_area_cleaned_today`,`sensor.${e}_mission_expire_time`,`image.${e}_coverage_map`,`image.${e}_map`,`sensor.${e}_room_accessibility_scores`,`sensor.${e}_robot_health_score`,`sensor.${e}_wheel_last_cleaned`,`sensor.${e}_contact_last_cleaned`,`sensor.${e}_bin_last_cleaned`,`sensor.${e}_battery_last_replaced`,`sensor.${e}_mission_progress`,`sensor.${e}_last_mission_result`,`sensor.${e}_consecutive_mission_anomalies`,`select.${e}_carpet_boost_select`,`switch.${e}_edge_clean`,`switch.${e}_always_finish`,`binary_sensor.${e}_demand_clean_blocked`,`sensor.${e}_optimal_clean_window`,`binary_sensor.${e}_cloud_connected`,`binary_sensor.${e}_mqtt_stale`,`sensor.${e}_firmware_version`,`device_tracker.${e}_position`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.healthDetailsExpanded=!1,this.openMaintPopover=null,this.activeTab=null,this.roomPickerOpen=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.openExplain=null,this.openReplay=null,this.openMissionMap=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",this.clearAllTimers()}async switchRobot(e){if(e===this.activeRobot)return;this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new ke(this._hass,this.config,e),this.loadHistory()),this.render();let r=this.config.robot_selector_helper;if(r&&this._hass.states[r]){let a=r.split(".")[0],s=a==="input_select"?"select_option":"set_value",o=a==="input_select"?{entity_id:r,option:e}:{entity_id:r,value:e};try{await this._hass.callService(a,s,o)}catch(i){console.warn("roomba-plus-card: robot_selector_helper write failed",i)}}}maybeSubscribeMissionEvents(){if(this.missionEventUnsub||this.missionEventSubscribing)return;let e=this._hass?.connection;!e||!this.apiClient||(this.missionEventSubscribing=!0,e.subscribeMessage(r=>{this.onMissionCompletedEvent(r?.data?.entry_id)},{type:"subscribe_events",event_type:"roomba_plus_mission_completed"}).then(r=>{this.missionEventUnsub=r,this.missionEventSubscribing=!1}).catch(()=>{this.missionEventSubscribing=!1}))}async onMissionCompletedEvent(e){if(!this.apiClient)return;let r=null;try{r=await this.apiClient.getEntryId()}catch{r=null}ut(r,e)&&this.loadHistory()}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let e=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let r=this.config.history_days??28,a=await this.apiClient.fetchSummary(r),s=await this.apiClient.fetchRecords(r);if(s.length>0){let c=new Map;for(let d of s){let p=d.started_at.slice(0,10);c.has(p)||c.set(p,[]),c.get(p).push(d)}for(let d of a){let p=c.get(d.date);p&&(d.missions=p.sort((l,u)=>l.started_at.localeCompare(u.started_at)))}}let o=await this.apiClient.fetchHazards(),i=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(r):null;this.missionData=a,this.firstRecord=s.length>0?s[s.length-1]:null,this.firstSummary=a.length>0?a[a.length-1]:null,this.hazards=o,this.householdData=i}catch(r){let a=r.message;this.historyError=a==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==e)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let e=Ae(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=this._hass.config?.unit_system?.length==="m",a=new Date,s=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`,i=(this.missionData?.find(R=>R.date===s)??null)?.total??null;this.activeTab===null&&(this.activeTab=Ne(this.config,e));let c=at(this.config,e);c.some(R=>R.id===this.activeTab)||(this.activeTab=Ne(this.config,e));let d=tt(this._hass,this.config,e,this.robotName),p=d;d?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=d):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),p=this.lastAlertHtml);let l=st({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:i,missionData:this.missionData,roomPickerOpen:this.roomPickerOpen,selectedRoomCount:this.selectedRooms.size,activeRobot:this.activeRobot}),u=this.roomPickerOpen?Me({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:!1}):"",y={health:ot(this._hass,e,this.robotName),history:it(this._hass,e,this.robotName)},k=lt(c,this.activeTab,y),g=Ct(this.activeTab,{hass:this._hass,config:this.config,caps:e,robotName:this.robotName,isMetric:r,missionData:this.missionData,historyLoading:this.historyLoading,historyError:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,openExplain:this.openExplain,openReplay:this.openReplay,openMissionMap:this.openMissionMap,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.historyTab,hazards:this.hazards,selectedRooms:this.selectedRooms,openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown,healthDetailsExpanded:this.healthDetailsExpanded,openMaintPopover:this.openMaintPopover,navDetailsExpanded:this.navDetailsExpanded,holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling,settingsPanelOpen:this.settingsPanelOpen,isSendingClean:this.isSendingClean,sendError:this.sendError,passes:this.passes,maintenanceLinksHtml:this.renderMaintenanceLinks(e),alertZoneHtml:p}),b=this.viewMode==="household"?`
        <button class="rpc-household-back" data-household-back>\u2190 Back</button>
        ${rt(this._hass,this.config,e,this.householdData,r)}
      `:`
        ${l}
        ${u}
        ${k}
        <div class="rpc-tab-panel">
          ${g}
        </div>
      `,T=`
      <style>${Et}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${b}
      </div>
    `;this.root.innerHTML=T}renderMaintenanceLinks(e){if(!e.hasMaintenanceCalendar&&!this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`])return"";let r=this.robotName,a=[];return this._hass.states[`sensor.${r}_wheel_last_cleaned`]&&a.push({label:"Wheel cleaning",service:"roomba_plus.reset_wheel_cleaning",tsEntityId:`sensor.${r}_wheel_last_cleaned`}),this._hass.states[`sensor.${r}_contact_last_cleaned`]&&a.push({label:"Contact cleaning",service:"roomba_plus.reset_contact_cleaning",tsEntityId:`sensor.${r}_contact_last_cleaned`}),this._hass.states[`sensor.${r}_bin_last_cleaned`]&&a.push({label:"Bin cleaning",service:"roomba_plus.reset_bin_cleaning",tsEntityId:`sensor.${r}_bin_last_cleaned`}),this._hass.states[`sensor.${r}_battery_capacity_retention`]&&a.push({label:"Battery baseline",service:"roomba_plus.reset_battery",tsEntityId:`sensor.${r}_battery_last_replaced`}),a.length===0?"":`
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${a.map(s=>{let o=this._hass.states[s.tsEntityId],c=!!o&&o.state!=="unavailable"&&o.state!=="unknown"?`Reset ${J(o.state,this._hass.language)}`:"Never recorded";return`
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${s.label}</span>
            <span class="rpc-maint-link-service">${s.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${c}</div>
        `}).join("")}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools \u2192 Services</div>
    `}renderRobotSelectorBar(){let e=this.entityList();if(e.length<2)return"";let r=e.map(s=>{let o=this._hass.states[s]?.attributes?.friendly_name??s,i=this.viewMode==="robot"&&s===this.activeRobot?" selected":"";return`<option value="${s}"${i}>${o}</option>`}).join(""),a=this.viewMode==="household"?" selected":"";return`
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${r}</optgroup>
          <optgroup label="View">
            <option value="__household__"${a}>\u{1F4CA} Household summary</option>
          </optgroup>
        </select>
      </div>`}dispatchClick(e,r){let a=r.dataset;if(Mt(e)){let s={room:a.room??a.roomPoly??a.roomLabel,tab:a.tab,bar:a.bar,maint:a.maint,historyTab:a.historyTab};if(e==="heatmap-cell"){let i=r.getAttribute("data-date");s.date=i,this.openDay!==i&&(s.daySummaryForDate=this.missionData?.find(c=>c.date===i)??null,s.dayMissionsForDate=this.buildDayMissions(i))}let o=St(e,this,s);Object.assign(this,o),this.render(),e==="bar"&&!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0);return}switch(e){case"action":this.handleAction(a.action);return;case"pass":{let s=a.pass,o=a.passOption;this.passes=s,this.render();let i=`select.${this.robotName}_cleaning_passes`;this._hass.states[i]&&(this.passSettingInFlight=!0,this._hass.callService("select","select_option",{entity_id:i,option:o}).catch(()=>{}).finally(()=>{this.passSettingInFlight=!1}));return}case"reset":{let s=a.reset,o=a.service;this.resetting=s,this.resetError=null,this.render(),(async()=>{try{await this._hass.callService("roomba_plus",o,{entity_id:this.activeRobot}),await new Promise(i=>setTimeout(i,800)),this.openPopover===s&&(this.openPopover=null)}catch{this.resetError=s}finally{this.resetting=null,this.render()}})();return}case"hold-action":{if(a.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let s=`switch.${this.robotName}_schedule_hold`,o=this._hass.states[s]?.state==="on";this.holdToggling=!0,this.render(),this._hass.callService("switch",o?"turn_off":"turn_on",{entity_id:s}).catch(()=>{}).finally(()=>{this.holdToggling=!1,this.render()})}return}case"switch-entity":{let s=a.switchEntity,o=this._hass.states[s]?.state==="on";this._hass.callService("switch",o?"turn_off":"turn_on",{entity_id:s}).catch(()=>{});return}case"cycle-entity":{let s=a.cycleEntity,o=[];try{o=JSON.parse(a.cycleOptions??"[]")}catch{o=[]}let i=a.cycleCurrent??"",c=o.indexOf(i),d=o.length>0?o[(c+1)%o.length]:null;d&&this._hass.callService("select","select_option",{entity_id:s,option:d}).catch(()=>{});return}case"fav-entity":{let s=a.favEntity;this._hass.callService("button","press",{entity_id:s}).catch(()=>{});return}case"replay":{let s=parseInt(r.getAttribute("data-replay"),10);if(this.openReplay?.nMssn===s){this.openReplay=null,this.render();return}if(!this.apiClient){this.openReplay={nMssn:s,data:null,error:!0},this.render();return}this.openReplay={nMssn:s,data:null},this.render(),this.apiClient.fetchPath(s).then(o=>{this.openReplay?.nMssn===s&&(this.openReplay=o===null?{nMssn:s,data:null,error:!0}:{nMssn:s,data:o},this.render())}).catch(()=>{this.openReplay?.nMssn===s&&(this.openReplay={nMssn:s,data:null,error:!0},this.render())});return}case"map":{let s=r.getAttribute("data-map");if(this.openMissionMap?.recordId===s){this.openMissionMap=null,this.render();return}if(!this.apiClient){this.openMissionMap={recordId:s,data:null,status:"error"},this.render();return}this.openMissionMap={recordId:s,data:null},this.render(),this.apiClient.fetchMissionMap(s).then(o=>{this.openMissionMap?.recordId===s&&(this.openMissionMap=o.status==="ok"?{recordId:s,data:o.data}:{recordId:s,data:null,status:o.status},this.render())}).catch(()=>{this.openMissionMap?.recordId===s&&(this.openMissionMap={recordId:s,data:null,status:"error"},this.render())});return}case"explain":{let s=r.getAttribute("data-explain");if(this.openExplain?.missionId===s){this.openExplain=null,this.render();return}if(!this.apiClient){this.openExplain={missionId:s,data:null,error:!0},this.render();return}this.openExplain={missionId:s,data:null},this.render(),this.apiClient.fetchExplain(s).then(o=>{this.openExplain?.missionId===s&&(this.openExplain=o===null?{missionId:s,data:null,error:!0}:{missionId:s,data:o},this.render())}).catch(()=>{this.openExplain?.missionId===s&&(this.openExplain={missionId:s,data:null,error:!0},this.render())});return}}}buildDayMissions(e){let r=this.missionData?.find(a=>a.date===e);return!r||r.total===0?[]:r.missions&&r.missions.length>0?r.missions:[]}async handleAction(e){let r=Rt(e);switch(r.kind){case"toggle-room-picker":this.roomPickerOpen=!this.roomPickerOpen,this.render();return;case"clean-selected":return this.runCleanSelected();case"repeat-last":return this.runRepeatLast();case"vacuum":return this.runVacuumAction(r.domain,r.service,r.action,r.pulse);case"noop":return}}async runCleanSelected(){let e=this.activeRobot,r=this.robotName;this.isSendingClean=!0,this.sendError=null,this.render();let a=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let s=`select.${r}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[s]&&await this._hass.callService("select","select_option",{entity_id:s,option:Te[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:e,room_name:a,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render()}async runRepeatLast(){let e=this.robotName;try{await this._hass.callService("button","press",{entity_id:`button.${e}_repeat_mission`})}catch{}}async runVacuumAction(e,r,a,s){let o=this.activeRobot;if(this.loadingAction=a,this.render(),s){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(e,r,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(e,r,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=Ae(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=4;return e.hasSmartZones&&this.config.show_rooms!==!1&&(r+=3),this.config.show_health!==!1&&(r+=2),this.config.show_schedule!==!1&&(r+=2),this.config.show_history!==!1&&(r+=4),r}static getConfigForm(){return{schema:dt()}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",Fe);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
