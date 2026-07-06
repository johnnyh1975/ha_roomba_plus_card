function Se(t,n,e,r,s){let a=l=>!!t.states[`sensor.${n}_${l}`],o=l=>!!t.states[`select.${n}_${l}`],i=l=>!!t.states[`binary_sensor.${n}_${l}`],c=l=>!!t.states[`image.${n}_${l}`],d=a("mop_pad"),p=a("brush_remaining_hours");return{hasArea:a("area_cleaned_today"),hasBrush:p,hasPad:d,hasWater:a("mop_tank_level"),hasCleanBase:a("clean_base_status"),hasZones:o("smart_zone_select")||o("zone_select"),hasSmartZones:o("smart_zone_select"),hasProblemZone:a("problem_zone"),hasLifetimeArea:a("cleaning_analytics_30d"),hasWearRate:a("filter_wear_rate"),isMop:d&&!p,hasMissionActive:i("mission_active"),hasMissionPhase:a("phase"),hasCleaningSpeedTrend:a("cleaning_performance"),hasBatteryRetention:a("battery_capacity_retention"),hasWifiFloor:a("wifi_health"),hasCoveragePct:a("recent_coverage_pct"),hasBatteryEol:a("estimated_battery_eol"),hasConsecutiveSkips:a("consecutive_clean_skips"),hasMopBehavior:a("mop_behavior"),hasCoverageImage:c("coverage_map"),hasWifiSignal:r?.wifi_signal!=null,hasRoomCoverage:r!=null&&"room_coverage"in r,hasDirtDensity:s!=null&&"dirt_density"in s,hasRobotSelectorHelper:!!e.robot_selector_helper&&!!t.states[e.robot_selector_helper],hasCleanedRooms:Array.isArray(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms)&&(t.states[`vacuum.${n}`]?.attributes?.last_cleaned_rooms).length>0,hasDemandBlocked:i("demand_clean_blocked"),hasEnergyConsumption:a("total_energy_consumed"),hasOptimalWindow:a("optimal_clean_window"),hasRobotHealthScore:a("robot_health_score"),hasNavStats:a("nav_panics")||a("nav_landmark_quality"),hasMaintenanceCalendar:a("wheel_last_cleaned")||a("contact_last_cleaned")||a("bin_last_cleaned"),hasMissionProgressSensor:a("mission_progress"),hasAlignment:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.rooms;return!!l&&typeof l=="object"&&Object.keys(l).length>0})(),hasZoneOverlays:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.zones;return Array.isArray(l)&&l.length>0})(),hasDoorMarkers:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.door_markers;return Array.isArray(l)&&l.length>0})(),hasFurnitureShadows:(()=>{let l=t.states[`image.${n}_map`]?.attributes?.furniture_candidates;return Array.isArray(l)&&l.length>0})(),hasFavorites:Object.keys(t.states).some(l=>l.startsWith(`button.${n}_fav_`)),hasConnectivity:i("cloud_connected")||i("mqtt_stale"),hasFirmware:a("firmware_version"),hasPositionTracker:!!t.states[`device_tracker.${n}_position`],hasRoomsOverdue:a("rooms_overdue"),hasDirtCorrelation:a("dirt_weather_correlation")}}var xe=class{constructor(n,e,r){this.hass=n;this.entryId=null;this.entityId=r??e.entity}updateHass(n){this.hass=n}async fetchSummary(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=summary&days=${n}`,s=await this.hass.fetchWithAuth(r);if(!s.ok)throw new Error(`${s.status}`);return s.json()}async fetchRecords(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=records&days=${n}`,s=await this.hass.fetchWithAuth(r);return s.ok?s.json():[]}async fetchExplain(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission/${encodeURIComponent(n)}/explain`,s=await this.hass.fetchWithAuth(r);return s.ok?s.json():null}async fetchPath(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/mission/${n}/path`,s=await this.hass.fetchWithAuth(r);return s.ok?s.json():null}async fetchMissionMap(n){let r=`/api/roomba_plus/${await this.resolveEntryId()}/missions/${encodeURIComponent(n)}/map.json`,s;try{s=await this.hass.fetchWithAuth(r)}catch{return{status:"error"}}if(s.status===404)return{status:"absent"};if(!s.ok)return{status:"error"};try{return{status:"ok",data:await s.json()}}catch{return{status:"error"}}}async getEntryId(){return this.resolveEntryId()}async resolveEntryId(){if(this.entryId)return this.entryId;let n=await this.hass.callWS({type:"config/entity_registry/get",entity_id:this.entityId});return this.entryId=n.config_entry_id,this.entryId}async fetchHazards(){let e=`/api/roomba_plus/${await this.resolveEntryId()}/mission_history?format=hazards`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():[]}async fetchHousehold(n){let e=`/api/roomba_plus/household?days=${n}`,r=await this.hass.fetchWithAuth(e);return r.ok?r.json():null}};function h(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function X(t,n="en"){let e=Date.now()-new Date(t).getTime(),r=Math.floor(e/6e4);try{let s=new Intl.RelativeTimeFormat(n,{numeric:"auto"});if(r<1)return s.format(0,"minute");if(r<60)return s.format(-r,"minute");let a=Math.floor(r/60);if(a<24)return s.format(-a,"hour");let o=Math.floor(a/24);return o<30?s.format(-o,"day"):s.format(-Math.floor(o/30),"month")}catch{if(r<1)return"just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);return s<24?`${s}h ago`:`${Math.floor(s/24)}d ago`}}var me={sofa:"\u{1F6CB}\uFE0F",bed:"\u{1F6CF}\uFE0F","bed-double":"\u{1F6CF}\uFE0F","silverware-fork-knife":"\u{1F37D}\uFE0F",stove:"\u{1F373}",microwave:"\u{1F4E6}",fridge:"\u{1F9CA}",toilet:"\u{1F6BD}",shower:"\u{1F6BF}",bathtub:"\u{1F6C1}",desk:"\u{1F5A5}\uFE0F","chair-rolling":"\u{1F4BA}",television:"\u{1F4FA}",bookshelf:"\u{1F4DA}",wardrobe:"\u{1F454}",home:"\u{1F3E0}",garage:"\u{1F697}",door:"\u{1F6AA}",stairs:"\u{1FA9C}",balcony:"\u{1F305}",pool:"\u{1F3CA}","washing-machine":"\u{1FAE7}",hanger:"\u{1F9F9}","baby-carriage":"\u{1F37C}",dog:"\u{1F415}",cat:"\u{1F408}","floor-plan":"\u{1F4D0}","map-marker":"\u{1F4CD}",star:"\u2B50",heart:"\u2764\uFE0F","office-building":"\u{1F3E2}",school:"\u{1F3EB}"},Ie="\u{1F4CD}";var Me={Auto:"Auto","\xD71":"One pass","\xD72":"Two passes"},Le={Auto:"Auto","One pass":"\xD71","Two passes":"\xD72"};function Re(t,n,e,r,s=!1){if(n.show_settings===!1)return"";let a=e,o=t.states[`switch.${a}_edge_clean`],i=t.states[`switch.${a}_always_finish`],c=t.states[`select.${a}_carpet_boost_select`];if(!o&&!i&&!c)return"";let d="";if(r){let u=o?.state==="on",v=i?.state==="on",w=c?c.attributes.options??[]:[];d=`
      <div class="rpc-settings-panel">
        ${o?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${u?" rpc-setting-on":""}"
                    data-switch-entity="switch.${a}_edge_clean"
                    aria-pressed="${u}">
              ${u?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${i?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${v?" rpc-setting-on":""}"
                    data-switch-entity="switch.${a}_always_finish"
                    aria-pressed="${v}">
              ${v?"\u25CF":"\u25CB"}
            </button>
          </div>`:""}
        ${c?`
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${a}_carpet_boost_select"
                    data-cycle-options="${h(JSON.stringify(w))}"
                    data-cycle-current="${h(c.state)}">
              ${h(c.state)} \u25BC
            </button>
          </div>`:""}
      </div>
    `}return`
    ${s?'<div class="rpc-settings-divider rpc-settings-divider--compact"></div>':'<div class="rpc-settings-divider"></div>'}
    ${s?'<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>':""}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${r}">
      <span class="rpc-settings-icon">\u2699</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${r?"\u25B2":"\u25BC"}</span>
    </button>
    ${d}
  `}function we(t){let{hass:n,config:e,caps:r,robotName:s,selectedRooms:a,passes:o,isSending:i,sendError:c,settingsPanelOpen:d,includeSettingsPanel:p=!0}=t;if(!r.hasSmartZones||e.show_rooms===!1)return"";let l=s,u=n.states[`select.${l}_smart_zone_select`];if(!u)return"";let v=u.attributes.options??[];if(v.length===0)return"";let w=n.states[`button.${l}_repeat_mission`],g=!!w&&w.state!=="unavailable",b=n.states[`select.${l}_cleaning_passes`],P=r.isMop?"\u25B6 Mop selected rooms":"\u25B6 Clean selected rooms",x=a.size,R='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',f=(()=>{let H=r.hasSmartZones?`select.${s}_smart_zone_select`:`select.${s}_zone_select`,A=n.states[H]?.attributes?.region_icons;return A&&typeof A=="object"&&!Array.isArray(A)?A:{}})(),$=v.map(H=>{let A=a.has(H),Y=f[H],G=Y?me[Y]??Ie:"",q=G?`${G} ${h(H)}`:h(H);return`<button class="rpc-room-chip${A?" rpc-room-chip--selected":""}"
      data-room="${h(H)}" aria-pressed="${A}">${q}</button>`}).join(""),y="";if(b){let H=o;y=`
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${["Auto","\xD71","\xD72"].map(A=>`<button class="rpc-pass-chip${H===A?" rpc-pass-chip--selected":""}"
            data-pass="${A}"
            data-pass-option="${h(Me[A]??A)}">${A}</button>`).join("")}
      </div>
    `}let E=p?Re(n,e,s,d):"";return`
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${$}
        ${x>0?`<span class="rpc-selected-count">${x} selected</span>`:""}
      </div>
      ${y}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${x===0||i?" rpc-btn-disabled":""}"
                data-action="clean-selected"
                ${x===0||i?"disabled":""}
                aria-label="${P}">
          ${i?R+" Sending\u2026":P}
        </button>
        ${g?'<button class="rpc-btn-text" data-action="repeat-last">\u21A9 Repeat last</button>':""}
      </div>
      ${c?`<div class="rpc-send-error">${h(c)}</div>`:""}
      ${E}
    </div>
  `}var Fe={completed:"#2d9c4f",stuck:"#dc2626",error:"#d97706",cancelled:"#9ca3af",none:"var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))"},J=24,Ee=2,fe=20,Ae=18,pe=J+Ee;function Be(t=7){return fe+t*pe-Ee}function je(t){return Ae+t*pe-Ee+4}function St(t,n){return t.toLocaleDateString(n,{month:"short",day:"numeric"})}function Oe(t){return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function We(t,n,e,r="en-US",s=!1){let a=new Map;for(let g of t)a.set(g.date,g);let o=new Date,i=new Date(o);i.setDate(o.getDate()-(n-1));let c=(i.getDay()+6)%7;i.setDate(i.getDate()-c);let d=Math.ceil((n+c)/7),p=[];for(let g=0;g<d;g++)for(let b=0;b<7;b++){let T=new Date(i);T.setDate(i.getDate()+g*7+b),!(T>o)&&p.push({date:T,summary:a.get(Oe(T))??null,col:b,row:g})}let l=Be(),u=je(d),v=["Mo","Tu","We","Th","Fr","Sa","Su"],w=`<svg width="${l}" height="${u}" viewBox="0 0 ${l} ${u}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;for(let g=0;g<7;g++){let b=fe+g*pe+J/2;w+=`<text x="${b}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${v[g]}</text>`}for(let g of p){let b=fe+g.col*pe,T=Ae+g.row*pe,P=g.summary?.result??"none",x=Fe[P]??Fe.none,R=g.summary?.total??0,f=St(g.date,r);if(R===0?f+=": no missions":R===1?f+=`: 1 mission, ${P}`:f+=`: ${R} missions, ${P}`,g.col===0){let y=g.date.getDate();w+=`<text x="${fe-3}" y="${T+J/2+3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${y}</text>`}let $="";if(s&&g.summary?.relative_to_baseline!=null){let y=g.summary.relative_to_baseline;$=` opacity="${Math.min(1,Math.max(.5,.5+y/4)).toFixed(2)}"`}if(w+=`<g role="gridcell" aria-label="${f}" data-date="${Oe(g.date)}" data-result="${P}" data-total="${R}" style="cursor:pointer">`,w+=`<rect x="${b-2}" y="${T-2}" width="${J+4}" height="${J+4}" fill="transparent" rx="4"/>`,w+=`<rect x="${b}" y="${T}" width="${J}" height="${J}" fill="${x}" rx="3"${$}/>`,R>1){let y=Math.min(R,3);for(let E=0;E<y;E++){let H=b+J-4-E*5,A=T+J-3;w+=`<circle cx="${H}" cy="${A}" r="2" fill="rgba(255,255,255,0.75)"/>`}}w+="</g>"}return w+="</svg>",w}function Ve(t){if(!t||t.length!==5)return null;let n=t.reduce((r,s)=>r+s,0);if(n===0)return null;let e=t.reduce((r,s,a)=>r+a*s,0)/n;return Math.round(e/4*100*10)/10}function Ze(t){if(!t||t.length===0)return[];if(t.length===5){let e=t.reduce((r,s)=>r+s,0);return e===0?[0,0,0,0,0]:t.map(r=>Math.round(r/e*100))}return t.every(e=>e<=4)?t.map(e=>e*25):t}function qe(t,n,e,r,s,a){let o=((t-e)/(r-e)*100).toFixed(1)+"%",i=((a-n)/(a-s)*100).toFixed(1)+"%";return{left:o,top:i}}function Ke(t){return t<=4?t*25:t}function Ue(t,n){if(!t||t.length===0)return"";let e=7,r=t.length<=e?[...t]:Array.from({length:e},(u,v)=>t[Math.round(v/(e-1)*(t.length-1))]),s=Math.max(...r,1),a=r.length,o=6,i=2,c=a*o+(a-1)*i,d=16,p=n>=60?"var(--rpc-green)":n>=40?"var(--rpc-amber)":"var(--rpc-red)",l="";for(let u=0;u<a;u++){let v=u*(o+i),w=Math.max(2,Math.round(r[u]/s*d)),g=d-w;l+=`<rect x="${v}" y="${g}" width="${o}" height="${w}" fill="${p}" rx="1"/>`}return`<svg width="${c}" height="${d}" viewBox="0 0 ${c} ${d}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${l}</svg>`}function Ye(t=4){let n=Be(),e=je(t),r=["Mo","Tu","We","Th","Fr","Sa","Su"],s=`<svg width="${n}" height="${e}" viewBox="0 0 ${n} ${e}" xmlns="http://www.w3.org/2000/svg">`;s+="<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>";for(let a=0;a<7;a++){let o=fe+a*pe+J/2;s+=`<text x="${o}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${r[a]}</text>`}for(let a=0;a<t;a++)for(let o=0;o<7;o++){let i=fe+o*pe,c=Ae+a*pe;s+=`<rect x="${i}" y="${c}" width="${J}" height="${J}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(a*7+o)*30}ms"/>`}return s+="</svg>",s}function Ge(t,n,e){let r=e,s=[],a=t.states[`vacuum.${r}`],o=!!a&&(a.state==="error"||!!a.attributes?.error_code),i=t.states[`sensor.${r}_last_error_code`];if(o&&i&&i.state!=="0"&&i.state!==""&&i.state!=="unknown"&&i.state!=="unavailable"){let l=h(i.attributes.label??`Error ${i.state}`),u=h(i.attributes.description??""),v=h(i.attributes.action??""),w=[u,v].filter(Boolean).join(" ")||void 0;s.push({priority:1,text:`Error: ${l}`,subtext:w,category:"none"})}else if(o){let l=a.attributes?.error_code,u=a.attributes?.error,v=u?`Error: ${h(u)}`:l!=null?`Error: Error ${h(String(l))}`:"Robot error \u2014 check the iRobot app";s.push({priority:1,text:v,category:"none"})}let c=t.states[`binary_sensor.${r}_maintenance_due`];if(c&&c.state==="on"){let l=t.states[`sensor.${r}_readiness`]?.state??"",u="Maintenance due";l==="bin_full"||l==="Bin Full"?u="Bin full \u2014 empty to continue":l&&l!=="Ready"&&l!=="unknown"&&l!=="unavailable"&&(u="Robot not ready \u2014 check the app"),s.push({priority:2,text:u,category:"health"})}if(n.hasWearRate){let l=t.states[`sensor.${r}_filter_wear_rate`],u=t.states[`sensor.${r}_filter_remaining_hours`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"&&u){let g=u.attributes.threshold_hours,b=parseFloat(l.state)/(g/90);b>1.5&&s.push({priority:3,text:`Filter wearing ${b.toFixed(1)}\xD7 faster than normal`,subtext:"Check for dust or debris buildup.",category:"health"})}let v=t.states[`sensor.${r}_brush_wear_rate`],w=t.states[`sensor.${r}_brush_remaining_hours`];if(v&&v.state!=="unknown"&&v.state!=="unavailable"&&w){let g=w.attributes.threshold_hours,b=parseFloat(v.state)/(g/90);b>1.5&&s.push({priority:4,text:`Brush wearing ${b.toFixed(1)}\xD7 faster than normal`,subtext:"Check for hair tangles.",category:"health"})}}let d=t.states[`sensor.${r}_nav_quality`];if(d&&d.state!=="unknown"&&d.state!=="unavailable"){let l=parseInt(d.state,10);!isNaN(l)&&l<60&&s.push({priority:5,text:`Navigation quality low (${l}/100)`,subtext:"Check lighting or move obstacles in the cleaning area.",category:"health"})}if(n.hasConsecutiveSkips){let l=t.states[`sensor.${r}_consecutive_clean_skips`];if(l&&l.state!=="unknown"&&l.state!=="unavailable"){let u=parseInt(l.state,10);if(!isNaN(u)&&u>0){let v=`Robot blocked from cleaning ${u} consecutive time${u!==1?"s":""}`;s.push({priority:6,text:v,subtext:"Check blocking sensors or robot placement.",category:"health"})}}}if(n.hasWifiFloor){let l=t.states[`sensor.${r}_wifi_health`],u=l?.attributes?.weakest_bucket_observed;if(l&&typeof u=="number"&&!isNaN(u)){let v=Ke(u);v<50&&s.push({priority:7,text:`Wi-Fi signal dropped to ${v}% during last mission`,subtext:"Consider moving the router or adding a Wi-Fi extender.",category:"history"})}}let p=t.states[`binary_sensor.${r}_layout_change_detected`];return p&&p.state==="on"&&s.push({priority:8,text:"Room layout may have changed",subtext:"Coverage pattern diverges from this robot\u2019s learned layout \u2014 moved furniture, or a new/removed obstacle.",category:"health"}),s}function Te(t,n,e,r){return Ge(t,n,e).some(s=>s.category===r)}function Xe(t,n,e,r){if(n.show_alerts===!1)return"";let s=Ge(t,e,r);if(s.length===0)return"";let a=s.sort((o,i)=>o.priority-i.priority)[0];return`
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">\u26A0\uFE0F</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${a.text}</div>
          ${a.subtext?`<div class="rpc-alert-sub">${a.subtext}</div>`:""}
        </div>
      </div>
    </div>
  `}function Je(t,n,e,r,s){if((n.entities?.length??0)<2||!r)return"";let a=n.area_unit??"auto",o=a==="m2"||a==="auto"&&s;function i(g){return g==null?"":o?`${Math.round(g*.0929)} m\xB2`:`${Math.round(g)} ft\xB2`}function c(g){return g>=90?"rpc-cov-green":g>=70?"rpc-cov-amber":"rpc-cov-red"}let d=r.robots.map(g=>{let b=Math.round(g.completion_pct),T=i(g.area_sqft),P=[`${g.missions} mission${g.missions!==1?"s":""}`,T].filter(Boolean).join(" \xB7 ");return`
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${h(g.name)}</span>
        <span class="${c(b)}">${b}%</span>
        <span class="rpc-household-meta">${P}</span>
      </div>`}).join(""),p="";r.floors&&r.floors.length>1&&(p=`<div class="rpc-household-floors">${r.floors.map(b=>{let T=i(b.area_sqft),P=[`${b.missions} mission${b.missions!==1?"s":""}`,T].filter(Boolean).join(" \xB7 ");return`
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${h(b.label)}</span>
          <span class="rpc-household-meta">${P}</span>
        </div>`}).join("")}</div>`);let l=r.total,u=Math.round(l.completion_pct),v=i(l.area_sqft),w=[`${l.missions} mission${l.missions!==1?"s":""}`,v].filter(Boolean).join(" \xB7 ");return`
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD \u2014 LAST ${r.period_days} DAYS</div>
      ${d}
      ${p}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${c(u)}">${u}%</span>
        <span class="rpc-household-meta">${w}</span>
      </div>
    </div>`}function he(t,n){return t.states[n]?.state??"unavailable"}function Qe(t,n,e){return n==="m2"||n==="auto"&&e?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Mt(t,n){if(!t)return null;for(let e=t.length-1;e>=0;e--){let r=t[e];if(r.missions&&r.missions.length>0)for(let s=r.missions.length-1;s>=0;s--){let a=r.missions[s];if(a.result==="completed")return X(a.started_at,n)}else if(r.completed>0)return X(r.date+"T12:00:00Z",n)}return null}function Rt(t){let n=["th","st","nd","rd"],e=t%100;return t+(n[(e-20)%10]??n[e]??n[0])}function et(t){let{hass:n,config:e,caps:r,robotName:s,loadingAction:a,todayMissionCount:o,roomPickerOpen:i,selectedRoomCount:c}=t,d=t.activeRobot??e.entity,p=he(n,d),l=n.states[d]?.attributes??{},u=n.config?.unit_system?.length==="m",v=e.area_unit??"auto",w=p==="unavailable",g=a!==null,b=s,T=`sensor.${b}_last_error_code`,P=`sensor.${b}_last_error_zone`,x=`sensor.${b}_mission_recharge_time`,R=`sensor.${b}_average_mission_time`,f=`sensor.${b}_area_cleaned_today`,$=l.mission_elapsed_min??null,y=l.mission_area_sqft??null,E=parseFloat(he(n,R)),H=isNaN(E)||E<=0?45:E,A=r.isMop,Y=A?"\u{1F9F9}":"\u{1F916}",G=h(l.friendly_name??d),q=n.states[`sensor.${b}_phase`]?.state??"",ne=(n.states[`binary_sensor.${b}_mission_active`]?.state??"")==="on",Q=r.hasMissionActive,I=n.states[`sensor.${b}_mission_expire_time`]?.state??"",N=I&&I!=="unavailable"&&I!=="unknown"?new Date(I):null,B=!!N&&!isNaN(N.getTime())&&N>new Date,O=B?Math.max(1,Math.round((N.getTime()-Date.now())/6e4)):null,L=!1;if(Q)L=p==="docked"&&ne;else{let m=he(n,x);L=p==="docked"&&(m!=="unavailable"&&m!=="unknown"&&I!=="unavailable"&&I!=="unknown")&&B}let U="";if(L&&r.hasMissionProgressSensor){let S=n.states[`sensor.${b}_mission_progress`]?.attributes?.recharge_min;typeof S=="number"&&(U=`<div class="rpc-recharge-line">\u26A1 Recharging \xB7 ${Math.round(S)} min</div>`)}let _="",F="",Z="";if(q==="evac")_="\u2B06",F="Emptying bin";else if(L)_="\u26A1",F=O!==null?`Recharging \u2014 resuming in ~${O} min`:"Recharging \u2014 mission continues";else switch(p){case"cleaning":_="\u25CF",F=A?"Mopping":"Cleaning";break;case"paused":_="\u23F8",F="Paused";break;case"returning":_="\u21A9",F="Returning to dock";break;case"docked":_="\u2713",F="Docked";break;case"idle":_="\u25CB",F="Idle";break;case"error":_="\u26A0",F="Error",Z="rpc-error-state";break;case"unavailable":_="\u2014",F="Unavailable";break}let de="";if(p==="error"){let m=n.states[T];if(m&&m.state!=="0"&&m.state!==""&&m.state!=="unavailable"){let S=h(m.attributes.description??"Unknown error"),M=h(m.attributes.action??""),k=he(n,P),z=k&&k!=="unknown"&&k!=="unavailable";F=`Error ${h(m.state)} \u2014 ${S}`,de=`
        ${M?`<div class="rpc-error-action">${M}</div>`:""}
        ${z?`<div class="rpc-error-zone">Zone: ${h(k)}</div>`:""}
      `}else F="Robot error \u2014 check the iRobot app"}let K="";if((Q?ne:p==="cleaning"||L)&&r.hasArea){let m=parseFloat(he(n,f));if(!isNaN(m)&&m>0){let S=Qe(m,v,u),M=o!==null?o+1:null,k=M!==null&&M>1?` \xB7 ${h(Rt(M))} mission`:"";K=`<div class="rpc-area-today">${S} already today${k}</div>`}}let ae="";p==="cleaning"&&$!==null&&(ae=`<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${Math.min($/H*100,95)}%"></div></div>`);let se="";if(p==="cleaning")if(r.hasMissionProgressSensor){let m=n.states[`sensor.${b}_mission_progress`],S=m?.attributes?.current_room,M=m&&m.state!=="unavailable"&&m.state!=="unknown"?parseFloat(m.state):NaN;if(S||!isNaN(M)){let k=[];S&&k.push(h(S)),isNaN(M)||k.push(`${Math.round(M)}%`);let z=m?.attributes?.mission_duration_min,W=m?.attributes?.recharge_min;typeof z=="number"&&typeof W=="number"&&W>0&&k.push(`${Math.round(z)} min (${Math.round(W)} min charging)`),se=`<div class="rpc-spatial-line">${k.join(" \xB7 ")}</div>`}}else{let m=l.mission_destination;m&&(se=`<div class="rpc-spatial-line">\u2192 Targeting: ${h(m)}</div>`)}let ge="";if(p==="cleaning"){let m=[];if($!==null){let S=Math.max(0,Math.round(H-$));m.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${S} min</span><span class="rpc-metric-lbl">Remaining</span></div>`)}if(r.hasArea&&y!==null){m.push(`<div class="rpc-metric"><span class="rpc-metric-val">${Qe(y,v,u)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);let S=parseFloat(he(n,`sensor.${b}_cleaning_analytics_30d`)),M=parseFloat(he(n,`sensor.${b}_missions_last_30d`)),k=!isNaN(S)&&!isNaN(M)&&M>=5?S/M:NaN;if(!isNaN(k)&&k>0){let z=Math.round((y-k)/k*100),W=z>=0?"\u25B2":"\u25BC",re=z>=0?"rpc-delta-up":"rpc-delta-down";m.push(`<div class="rpc-metric"><span class="rpc-metric-val ${re}">${W} ${Math.abs(z)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`)}}m.length&&(ge=`<div class="rpc-metrics-row">${m.join("")}</div>`)}let oe="";if(p==="docked"&&!L){let m=Mt(t.missionData,n.language);if(m)oe=`<div class="rpc-docked-since">Last cleaned: ${m}</div>`;else{let S=n.states[d]?.last_changed;S&&(oe=`<div class="rpc-docked-since">Last mission: ${X(S,n.language)}</div>`)}}let _e="";r.hasDemandBlocked&&n.states[`binary_sensor.${b}_demand_clean_blocked`]?.state==="on"&&(_e='<div class="rpc-demand-blocked">\u{1F9F9} Floor needs cleaning \u2014 waiting for home to be empty</div>');let ie="";if(r.hasCleanedRooms&&(p==="docked"||p==="idle")&&!L){let m=l.last_cleaned_rooms,S=l.region_icons;m&&m.length>0&&(ie=`<div class="rpc-cleaned-rooms">${m.map(k=>{let z=S?.[k],W=z?me[z]??"":"";return`<span class="rpc-cleaned-chip">${W?W+"\xA0":""}${h(k)}</span>`}).join("")}</div>`)}let le="";if(r.hasConnectivity){let m=n.states[`binary_sensor.${b}_cloud_connected`]?.state,S=n.states[`binary_sensor.${b}_mqtt_stale`]?.state,M=m==="off",k=S==="on";if(M||k){let z=k?"Robot offline":"Cloud offline";le=`<span class="rpc-connectivity rpc-connectivity-degraded" title="${h(z)}">\u2601 ${h(z)}</span>`}}let ve="";if(r.hasFirmware){let m=n.states[`sensor.${b}_firmware_version`],S=m?.state;if(S&&S!=="unavailable"&&S!=="unknown"){let M=m?.last_changed?new Date(m.last_changed).getTime():0;M>0&&Date.now()-M<24*60*60*1e3&&(ve=`<span class="rpc-firmware-badge" title="Firmware updated">\u2B06 FW ${h(S)}</span>`)}}let ce="",ue=new Set(["Docked","Angedockt","Cleaning","Unterwegs","unknown","unavailable"]),D=se!=="";if(r.hasPositionTracker&&!D&&(p==="cleaning"||Q&&ne)){let m=n.states[`device_tracker.${b}_position`]?.state;m&&!ue.has(m)&&(ce=`<div class="rpc-current-room">\u{1F4CD} ${h(m)}</div>`)}let te='<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>',j=(m,S,M)=>{let k=a===m;return`<button class="rpc-btn${k?" rpc-btn-loading":""}"
      data-action="${m}"
      ${w||g?"disabled":""}
      aria-label="${S}">
      ${k?te:M}
    </button>`},C="",V=r.hasDemandBlocked&&n.states[`binary_sensor.${b}_demand_clean_blocked`]?.state==="on";return p==="cleaning"||q==="evac"?C=j("pause","Pause","\u23F8 Pause")+j("return_home","Return home","\u{1F3E0} Return home"):p==="paused"?C=j("resume","Resume","\u25B6 Resume")+j("return_home","Return home","\u{1F3E0} Return home")+j("stop","Stop","\u23F9 Stop"):p==="error"?C=j("return_home","Return home","\u{1F3E0} Return home")+j("retry","Retry","\u{1F504} Retry"):L?C=j("return_home","Cancel mission","\u2715 Cancel mission"):p!=="returning"&&!w&&(c>0?C=j("clean-selected","Start selected rooms",`\u25B6 Start ${c} selected room${c!==1?"s":""}`):(C=j("start","Start full clean",V?"\u25B6 Start anyway":"\u25B6 Start full clean"),e.mode!=="companion"&&r.hasSmartZones&&(C+=`<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${i}">
          \u{1F5FA} Rooms\u2026
        </button>`))),`
    <div class="rpc-header${Z?" "+Z:""}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${Y}</span>
        <span class="rpc-robot-name">${G}</span>
        ${ve}
        ${le}
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${p}">${_}</span>
        <span class="rpc-state-label">${F}</span>
      </div>
      ${K}
      ${de}
      ${ae}
      ${se}
      ${ce}
      ${U}
      ${ge}
      ${oe}
      ${_e}
      ${ie}
      ${C?`<div class="rpc-actions">${C}</div>`:""}
    </div>
  `}function tt(t,n){let e=[];return t.mode!=="companion"&&n.hasCoverageImage&&e.push({id:"map",icon:"\u{1F5FA}",label:"Map"}),e.push({id:"history",icon:"\u{1F4C5}",label:"History"}),e.push({id:"health",icon:"\u2764",label:"Health"}),e.push({id:"settings",icon:"\u2699",label:""}),e}function He(t,n){return t.default_tab?t.default_tab:t.mode!=="companion"&&n.hasCoverageImage?"map":"history"}function rt(t,n,e){let r=e;if(n.hasRobotHealthScore){let s=t.states[`sensor.${r}_robot_health_score`];if(s&&s.state!=="unknown"&&s.state!=="unavailable"){let a=parseFloat(s.state);if(!isNaN(a)&&a<60)return!0}}if(n.hasMaintenanceCalendar){let s=[`sensor.${r}_wheel_last_cleaned`,`sensor.${r}_contact_last_cleaned`,`sensor.${r}_bin_last_cleaned`],a=Date.now();for(let o of s){let i=t.states[o];if(!i||i.state==="unavailable"||i.state==="unknown")continue;let c=new Date(i.state).getTime();if(!isNaN(c)&&(a-c)/864e5>90)return!0}}if(n.hasRoomsOverdue){let s=t.states[`sensor.${r}_rooms_overdue`];if(s&&s.state!=="unknown"&&s.state!=="unavailable"){let a=parseFloat(s.state);if(!isNaN(a)&&a>0)return!0}}return!!Te(t,n,e,"health")}function nt(t,n,e){return Te(t,n,e,"history")}function at(t,n,e={}){return`
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
  `}var Et=[["[data-action]","action"],["[data-room]","room"],["[data-pass]","pass"],["[data-bar]","bar"],["[data-tab]","tab"],["[data-household-back]","household-back"],["[data-room-poly]","room-overlay"],["[data-room-label]","room-overlay"],["[data-close]","close"],["[data-health-details-toggle]","health-details-toggle"],["[data-nav-details-toggle]","nav-details-toggle"],["[data-maint]","maint"],["[data-close-maint]","close-maint"],["[data-reset]","reset"],["[data-hold-action]","hold-action"],["[data-date]","heatmap-cell"],["[data-close-day]","close-day"],["[data-settings-toggle]","settings-toggle"],["[data-switch-entity]","switch-entity"],["[data-cycle-entity]","cycle-entity"],["[data-lifetime-toggle]","lifetime-toggle"],["[data-history-tab]","history-tab"],["[data-fav-entity]","fav-entity"],["[data-explain]","explain"],["[data-replay]","replay"],["[data-map]","map"]];function st(t){if(!t)return null;for(let[n,e]of Et){let r=t.closest(n);if(r)return{key:e,el:r}}return null}var At=[["[data-bar]","bar"],["[data-maint]","maint"]];function ot(t){if(!t)return null;for(let[n,e]of At){let r=t.closest(n);if(r)return{key:e,el:r}}return null}var Tt=["show_rooms","show_health","show_schedule","show_alerts","show_history","show_lifetime","show_dirt_events"];function it(){return[{name:"entity",label:"Robot vacuum",required:!0,selector:{entity:{domain:"vacuum"}}},{name:"entities",label:"Multiple robots (overrides single robot above)",selector:{entity:{domain:"vacuum",multiple:!0}}},{name:"mode",label:"Mode",selector:{select:{mode:"dropdown",options:[{value:"standalone",label:"Standalone \u2014 card owns the Map tab & room selection"},{value:"companion",label:"Companion \u2014 external map card handles spatial view"}]}}},{name:"default_tab",label:"Default tab on load",selector:{select:{mode:"dropdown",options:[{value:"map",label:"Map"},{value:"history",label:"History"},{value:"health",label:"Health"},{value:"settings",label:"Settings"}]}}},{name:"area_unit",label:"Area unit",selector:{select:{options:["auto","sqft","m2"],mode:"dropdown"}}},{name:"history_days",label:"History window",selector:{select:{options:[{value:7,label:"7 days"},{value:14,label:"14 days"},{value:28,label:"28 days"}],mode:"dropdown"}}},{name:"presence_entities",label:"Presence sensors (person.* entities)",selector:{entity:{domain:"person",multiple:!0}}},{name:"robot_selector_helper",label:"Robot selector helper (input_text or input_select \u2014 for xiaomi card sync)",selector:{entity:{domain:["input_text","input_select"]}}},{name:"",type:"expandable",title:"Advanced \u2014 content visibility",schema:Tt.map(t=>({name:t,label:Ht[t],selector:{boolean:{}}}))}]}var Ht={show_rooms:"Room selector (SMART robots, Map tab)",show_health:"Health tab content",show_schedule:"Schedule & presence content",show_alerts:"Alert banners",show_history:"History tab content",show_lifetime:"Lifetime stats (History tab)",show_dirt_events:"Dirt events in day detail"};function lt(t,n){return!(t&&n&&t!==n)}var ye=280,ze=12,ct=1e3;function zt(t){let n=Array.isArray(t.coverage_mm)?t.coverage_mm:[],e=t.rooms&&typeof t.rooms=="object"?Object.entries(t.rooms):[],r=[],s=[];for(let x of n){if(!Array.isArray(x)||x.length<2)continue;let[R,f]=x;typeof R!="number"||typeof f!="number"||!isFinite(R)||!isFinite(f)||(r.push(R),s.push(f))}for(let[,x]of e)if(Array.isArray(x))for(let R of x){if(!Array.isArray(R)||R.length<2)continue;let[f,$]=R;typeof f!="number"||typeof $!="number"||!isFinite(f)||!isFinite($)||(r.push(f),s.push($))}if(r.length===0)return{points:[],rooms:[],empty:!0};let a=Math.min(...r),o=Math.max(...r),i=Math.min(...s),c=Math.max(...s),d=Math.max(o-a,ct),p=Math.max(c-i,ct),u=(ye-2*ze)/Math.max(d,p),v=(x,R)=>[ze+(x-a)*u,ye-ze-(R-i)*u],w=100,g=t.point_area_m?.[0];typeof g=="number"&&isFinite(g)&&g>0&&(w=g*1e3);let b=Math.max(2,w*u/2),T=n.filter(x=>Array.isArray(x)&&x.length>=2&&typeof x[0]=="number"&&typeof x[1]=="number"&&isFinite(x[0])&&isFinite(x[1])).map(([x,R])=>{let[f,$]=v(x,R);return{x:f,y:$,r:b}}),P=e.map(([x,R])=>{if(!Array.isArray(R)||R.length<3)return null;let f=R.filter(y=>Array.isArray(y)&&y.length>=2&&typeof y[0]=="number"&&typeof y[1]=="number"&&isFinite(y[0])&&isFinite(y[1]));if(f.length<3)return null;let $=f.map(([y,E])=>v(y,E).join(",")).join(" ");return{name:x,points:$}}).filter(x=>x!==null);return{points:T,rooms:P,empty:T.length===0&&P.length===0}}function pt(t){let n=zt(t);if(n.empty)return'<div class="rpc-map-panel rpc-explain-panel--muted">No coverage data to draw for this mission.</div>';let e=n.rooms.map(s=>`<polygon class="rpc-map-room" points="${h(s.points)}"><title>${h(s.name)}</title></polygon>`).join(""),r=n.points.map(s=>`<circle class="rpc-map-dot" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.r.toFixed(1)}"/>`).join("");return`
    <div class="rpc-map-panel">
      <svg class="rpc-map-svg" viewBox="0 0 ${ye} ${ye}" width="${ye}" height="${ye}" role="img" aria-label="Mission coverage map">
        ${e}
        ${r}
      </svg>
    </div>`}function dt(t){if(!Array.isArray(t)||t.length<3)return null;let[n,e,r]=t;if(!n?.vacuum||!n?.map||!e?.vacuum||!e?.map||!r?.vacuum||!r?.map||![n.vacuum.x,n.vacuum.y,n.map.x,n.map.y,e.vacuum.x,e.vacuum.y,e.map.x,e.map.y,r.vacuum.x,r.vacuum.y,r.map.x,r.map.y].every(l=>typeof l=="number"&&Number.isFinite(l)))return null;let a=e.vacuum.x-n.vacuum.x,o=r.vacuum.y-e.vacuum.y;if(a===0||o===0)return null;let i=(e.map.x-n.map.x)/a,c=n.map.x-i*n.vacuum.x,d=(r.map.y-e.map.y)/o,p=e.map.y-d*e.vacuum.y;return{toPx(l,u){return{x:i*l+c,y:d*u+p}}}}function ke(t,n,e){let{x:r,y:s}=t.toPx(n,e);return{left:(r/600*100).toFixed(1)+"%",top:(s/600*100).toFixed(1)+"%"}}function Ce(t,n,e){let{x:r,y:s}=t.toPx(n,e);return{x:r/600*100,y:s/600*100}}var Pt={obstacle_or_blockage:"Obstacle or blockage",excessive_recharge:"Excessive recharging",dirt_spike:"Unusually dirty area",incomplete_coverage:"Incomplete coverage"};function Dt(t){return Pt[t]??t.replace(/_/g," ")}function Nt(t){if(!t.is_anomalous)return`<div class="rpc-explain-panel rpc-explain-panel--muted">Nothing statistically unusual vs. this robot's own history \u2014 the result code above is the whole story.</div>`;let n=t.anomaly_reason?Dt(t.anomaly_reason):"Anomalous mission",e=t.robot_lifted?'<div class="rpc-explain-lifted">Robot was picked up during this mission.</div>':"",r=t.recommended_action?`<div class="rpc-explain-rec">${h(t.recommended_action)}</div>`:"";return`
    <div class="rpc-explain-panel">
      <div class="rpc-explain-reason">${h(n)}</div>
      ${e}
      ${r}
    </div>`}function It(t,n){return t.path.length?`<div class="rpc-replay-panel">${t.path.map(r=>`<span class="rpc-replay-step"><span class="rpc-replay-time">${new Date(r.time).toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}</span> ${h(r.room)}</span>`).join('<span class="rpc-trav-sep">\u2192</span>')}</div>`:'<div class="rpc-replay-panel rpc-explain-panel--muted">No room-level path recorded for this mission.</div>'}function Lt(t){return pt(t)}function ut(t,n){return n?`${Math.round(t*.0929)} m\xB2`:`${t} ft\xB2`}function Ft(t){return t==="robot_learned"?"\u{1F6A7}":t==="keepout"?"\u{1F6AB}":"\u{1F4CD}"}var Ot=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function Bt(t){let n=t<12?"am":"pm";return`${t%12===0?12:t%12}${n}`}function jt(t){if(t.dominant_weekday==null||t.dominant_hour==null)return"";let n=Ot[t.dominant_weekday]??"";return n?` \xB7 usually ${n} ~${Bt(t.dominant_hour)}`:""}function Wt(t){let n=t.room_name?` \xB7 ${t.room_name}`:"";return t.source==="stuck_events"?`Stuck hotspot${t.stuck_count?` (${t.stuck_count}\xD7)`:""}${n}${jt(t)}`:t.source==="robot_learned"?`Robot-detected obstacle${n}`:t.source==="keepout"?`Keep-out zone${n}`:"Hazard"}function Pe(t,n,e,r,s,a){if(n.show_history===!1)return"";let o=r,i=n.history_days??28,c=n.area_unit??"auto",d=c==="m2"||c==="auto"&&a,{historyTab:p,hazards:l,mapSelectedRooms:u,suppressSubTabToggle:v,isMapContext:w}=s,g=t.states[`vacuum.${o}`]?.attributes??{},b=g.region_icons??{},T=g.last_cleaned_rooms??[],P=g.mission_destination??null,x=new Date().toLocaleDateString("en-CA"),R=s.openDay===x,f=t.states[`sensor.${o}_clean_streak`],$=t.states[`sensor.${o}_completion_rate_30d`],y=f?parseInt(f.state,10):0,E=$?parseInt($.state,10):NaN,H="",A=[];if(y>0&&A.push(`\u{1F525} ${y}-day streak`),isNaN(E)||A.push(`${E}% completion rate`),e.hasCleaningSpeedTrend){let N=t.states[`sensor.${o}_cleaning_performance`]?.attributes?.trend;N==="declining"?A.push('<span class="rpc-trend-declining">\u2193 Speed declining</span>'):N==="improving"&&A.push('<span class="rpc-trend-improving">\u2191 Speed improving</span>')}A.length&&(H=`<div class="rpc-history-summary">${A.map((I,N)=>N===0?I:`<span class="rpc-summary-sep">\xB7</span>${I}`).join("")}</div>`);let Y=e.hasCoverageImage&&!v?`
    <div class="rpc-history-tabs">
      <button class="rpc-tab${p==="calendar"?" active":""}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${p==="coverage"?" active":""}" data-history-tab="coverage">Coverage</button>
    </div>`:"",G="";if(e.hasCoverageImage&&p==="coverage"){let N=t.states[`image.${o}_coverage_map`]?.attributes??{},B=N.x_min_mm,O=N.x_max_mm,L=N.y_min_mm,U=N.y_max_mm,_=N.entity_picture,F=N.last_mission_end,Z=B!=null&&O!=null&&L!=null&&U!=null,de=Z?l.map(D=>{let te=qe(D.x_mm,D.y_mm,B,O,L,U),j=h(Wt(D)),C=Ft(D.source);return`<div class="rpc-hazard-pin rpc-pin-${D.source}" style="left:${te.left};top:${te.top}" title="${j}" aria-label="${j}">${C}</div>`}).join(""):"",K=!Z&&_?'<div class="rpc-coverage-note">Spatial overlay unavailable \u2014 grid accumulating</div>':"",ee=F?`<div class="rpc-coverage-updated">Updated ${X(F,t.language)}</div>`:"",ae=l.some(D=>D.source==="stuck_events"),se=l.some(D=>D.source==="robot_learned"),ge=l.some(D=>D.source==="keepout"),oe=[ae?"<span>\u{1F4CD}</span> Stuck hotspot":"",se?"<span>\u{1F6A7}</span> Robot obstacle":"",ge?"<span>\u{1F6AB}</span> Keep-out zone":""].filter(Boolean).join(" "),ie=l.some(D=>D.source==="stuck_events"&&D.stuck_count!=null&&D.stuck_count>=3&&D.stuck_count<8&&D.dominant_weekday==null)?'<div class="rpc-coverage-note">Time patterns need \u22658 stuck events at one spot</div>':"",le="",ve="",ce="",ue="";if(e.hasAlignment){let D=t.states[`image.${o}_map`]?.attributes??{},te=D.rooms??{},j=D.calibration_points,C=Array.isArray(j)?dt(j):null;if(C){let V=Object.values(te).map(M=>{if(!M.outline||M.outline.length<3)return"";let k=M.outline.map(([W,re])=>{let be=Ce(C,W,re);return`${be.x.toFixed(1)},${be.y.toFixed(1)}`}).join(" ");return`<polygon class="rpc-room-poly${u?.has(M.name)??!1?" rpc-room-poly--selected":""}"
            points="${k}" data-room-poly="${h(M.name)}" />`}).join(""),m=(()=>{let M=e.hasSmartZones?`select.${o}_smart_zone_select`:`select.${o}_zone_select`,k=t.states[M]?.attributes?.region_areas_m2;return k&&typeof k=="object"&&!Array.isArray(k)?k:{}})(),S=Object.values(te).map(M=>{let k=ke(C,M.x,M.y),z=me[M.icon]??"",W=u?.has(M.name)??!1,re=m[M.name],be=typeof re=="number"&&!isNaN(re)?` / ${re.toFixed(1)} m\xB2`:"";return`<div class="rpc-room-label${W?" rpc-room-label--selected":""}"
            style="left:${k.left};top:${k.top}" data-room-label="${h(M.name)}">
            ${z?`${z} `:""}${h(M.name)}${h(be)}
          </div>`}).join("");if(le=`
          <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            ${V}
          </svg>
          ${S}
        `,e.hasZoneOverlays){let k=(D.zones??[]).map(z=>{if(z.type==="observed"){let W=Ce(C,z.x,z.y);return`<circle class="rpc-zone-observed" cx="${W.x.toFixed(1)}" cy="${W.y.toFixed(1)}" r="2"><title>Robot-detected obstacle</title></circle>`}return z.type==="keepout"&&z.polygon.length>=3?`<polygon class="rpc-zone-keepout" points="${z.polygon.map(([re,be])=>{let Ne=Ce(C,re,be);return`${Ne.x.toFixed(1)},${Ne.y.toFixed(1)}`}).join(" ")}"><title>Keep-out zone</title></polygon>`:""}).join("");ve=k?`<svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">${k}</svg>`:""}e.hasDoorMarkers&&(ce=(D.door_markers??[]).map(k=>{let z=ke(C,k.cx,k.cy),W=h(`${k.label} (seen ${k.mission_count}\xD7)`);return`<div class="rpc-door-marker" style="left:${z.left};top:${z.top}" title="${W}" aria-label="${W}">\u{1F6AA}</div>`}).join("")),e.hasFurnitureShadows&&(ue=(D.furniture_candidates??[]).map(k=>{let z=ke(C,k.x_mm,k.y_mm);return`<div class="rpc-furniture-shadow" style="left:${z.left};top:${z.top}" title="Possible furniture change" aria-label="Possible furniture change"></div>`}).join(""))}}G=_?`
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${_}" alt="Coverage map" />
          ${le}
          ${ve}
          ${ce}
          ${ue}
          ${de}
        </div>
        ${K}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">\u25CF</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">\u25CF</span> Rarely cleaned
          ${oe}
        </div>
        ${ie}
        ${ee}
      </div>`:'<div class="rpc-history-error">Coverage map unavailable</div>'}let q="";s.loading&&!s.data?q=Ye(Math.ceil(i/7)):s.error?q=`<div class="rpc-history-error">${h(s.error)}</div>`:s.data&&(q=We(s.data,i,c,t.language,e.hasDirtDensity),s.data.length<i&&(q+=`<div class="rpc-history-partial">Showing ${s.data.length} of ${i} days \u2014 full history builds over time</div>`));let $e="";if(e.hasProblemZone){let I=t.states[`sensor.${o}_problem_zone`],N=t.states[`sensor.${o}_stuck_count_30d`];if(I&&I.state!=="unknown"&&I.state!=="unavailable"){let B=N?parseInt(N.state,10):0;B>0&&($e=`<div class="rpc-problem-zone">\u26A0 ${h(I.state)} \u2014 stuck ${B}\xD7 in 30 days</div>`)}}let ne="";if(s.openDay){let N=new Date(s.openDay+"T00:00:00").toLocaleDateString(t.language,{weekday:"long",month:"long",day:"numeric",year:"numeric"}),B=s.dayMissions,O=s.openDaySummary,L="";if(B===null)L="";else if(O&&O.total===0)L='<div class="rpc-day-empty">No missions this day</div>';else if(B.length>0)L=B.map((_,F)=>{let Z=_.result==="completed"||_.result==="stuck_and_resumed"?"success":_.result==="stuck"||_.result==="stuck_and_abandoned"||_.result==="blocked_timeout"?"failure":"caution",de=Z==="success"?"\u2713":Z==="failure"?"\u2717":"\u26A0",K=Z==="success"?"rpc-day-ok":Z==="failure"?"rpc-day-err":"rpc-day-caution",ee=new Date(_.started_at).toLocaleTimeString(t.language,{hour:"2-digit",minute:"2-digit",hour12:!1}),ae=_.area_sqft!==null?ut(_.area_sqft,d):"\u2014",se=_.zones?.map(C=>h(C)).join(" \xB7 ")??"",ge=n.show_dirt_events&&_.dirt_events!=null&&_.dirt_events>0?`${_.dirt_events} dirt event${_.dirt_events!==1?"s":""}`:"",oe=[se,ge].filter(Boolean).join(" \xB7 "),_e=_.initiator==="demand"?'<span class="rpc-initiator-badge">demand</span>':"",ie="";if(_.wifi_signal&&_.wifi_signal.length>0){let C=_.wifi_signal.length===5,V=Ze(_.wifi_signal),m=Ue(V,Math.min(...V));if(C){let S=Ve(_.wifi_signal);S!==null&&(ie=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${S}% average during mission"><span aria-hidden="true">\u{1F4F6}</span>${m}<span>${S}% avg</span></div>`)}else{let S=Math.min(...V);ie=`<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${S}% during mission"><span aria-hidden="true">\u{1F4F6}</span>${m}<span>${S}% min</span></div>`}}let le="";if(R&&F===B.length-1&&T.length>0){let C=T.map(m=>{let S=b[m],M=S?me[S]??"":"";return`<span class="rpc-trav-room">${M?M+"\xA0":""}${h(m)}</span>`}).join('<span class="rpc-trav-sep">\u2192</span>'),V=P?`<div class="rpc-mission-dest-popover">\u2192 Final: ${h(P)}</div>`:"";le=`<div class="rpc-traversal-row">${C}</div>${V}`}let ce="";_.room_coverage&&Object.keys(_.room_coverage).length>0&&(ce=`<div class="rpc-room-coverage">${Object.entries(_.room_coverage).map(([V,m])=>{let S=Math.round(m*100);return`<span class="${S>=80?"rpc-cov-green":S>=60?"rpc-cov-amber":"rpc-cov-red"}">${h(V)} ${S}%</span>`}).join(" \xB7 ")}</div>`);let ue="";_.alignment_confidence!=null&&_.alignment_confidence<.85&&(ue=`<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${Math.round(_.alignment_confidence*100)}%)</div>`);let D="";if(Z!=="success"){let C=s.openExplain?.missionId===_.id?s.openExplain:null,V=`<button class="rpc-explain-btn" data-explain="${h(_.id)}" aria-expanded="${!!C}">Why?</button>`,m="";C&&(C.error?m='<div class="rpc-explain-panel rpc-explain-panel--muted">Explanation not available for this mission.</div>':C.data===null?m='<div class="rpc-explain-panel rpc-explain-panel--muted">Analysing\u2026</div>':m=Nt(C.data)),D=`${V}${m}`}let te="";if(_.n_mssn!=null){let C=s.openReplay?.nMssn===_.n_mssn?s.openReplay:null,V=`<button class="rpc-explain-btn" data-replay="${_.n_mssn}" aria-expanded="${!!C}">Route</button>`,m="";C&&(C.error?m='<div class="rpc-replay-panel rpc-explain-panel--muted">Path not available for this mission.</div>':C.data===null?m='<div class="rpc-replay-panel rpc-explain-panel--muted">Loading\u2026</div>':m=It(C.data,t.language)),te=`${V}${m}`}let j="";if(_.source==="local"&&_.n_mssn!=null){let C=s.openMissionMap?.recordId===_.id?s.openMissionMap:null,V=`<button class="rpc-explain-btn" data-map="${h(_.id)}" aria-expanded="${!!C}">Map</button>`,m="";C&&(C.status==="absent"?m='<div class="rpc-map-panel rpc-explain-panel--muted">No coverage map for this mission.</div>':C.status==="error"?m=`<div class="rpc-map-panel rpc-explain-panel--muted">Couldn't load the map \u2014 try again.</div>`:C.data===null?m='<div class="rpc-map-panel rpc-explain-panel--muted">Loading\u2026</div>':m=Lt(C.data)),j=`${V}${m}`}return`
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${K}">${de}</span>
            <span class="rpc-day-time">${ee}</span>
            <span class="rpc-day-dur">${_.duration_min} min</span>
            <span class="rpc-day-area">${ae}</span>
            ${_e}
            ${oe?`<div class="rpc-day-zones">${oe}</div>`:""}
            ${ie}
            ${le}
            ${ce}
            ${ue}
            ${D}
            ${te}
            ${j}
          </div>`}).join("");else if(O&&O.total>0){let _=O.area_sqft!==null?ut(O.area_sqft,d):null;L=`
        <div class="rpc-day-aggregate">
          <div>${O.total} mission${O.total>1?"s":""} \xB7 ${h(O.result)}
            ${_?` \xB7 ${_} total`:""}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`}let U=O?.total??0;ne=`
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${h(N)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">\xD7</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${U>0&&B&&B.length>0?`<div class="rpc-day-count">${U} mission${U>1?"s":""}</div>`:""}
        ${L}
      </div>
    `}let Q="";if(n.show_lifetime!==!1){let I=t.states[`sensor.${o}_lifetime_missions`],N=t.states[`sensor.${o}_cleaning_analytics_30d`],B=I?parseInt(I.state,10):NaN,O=(()=>{let K=N?.attributes?.time_h;return typeof K=="number"?K:NaN})(),L=N?parseFloat(N.state):NaN,U=K=>{let ee=t.states[K];return!ee||ee.state==="unknown"||ee.state==="unavailable"?NaN:parseInt(ee.state,10)},_=U(`sensor.${o}_optical_dirt_detections`),F=U(`sensor.${o}_piezo_dirt_detections`),Z=U(`sensor.${o}_scrubs_count`);if(!isNaN(B)||!isNaN(O)||!isNaN(L)||!isNaN(_)||!isNaN(F)||!isNaN(Z)){let K=[isNaN(_)?"":`${_.toLocaleString()} optical`,isNaN(F)?"":`${F.toLocaleString()} piezo`,isNaN(Z)?"":`${Z.toLocaleString()} scrub events`].filter(Boolean),ee=K.length?`<div class="rpc-lifetime-stats rpc-lifetime-dirt">
            <span class="rpc-lifetime-arrow">\u2192</span>
            <span>Dirt detect: ${K.join(" \xB7 ")}</span>
          </div>`:"",ae=s.lifetimeExpanded?`
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">\u2192</span>
          ${isNaN(B)?"":`<span>${B.toLocaleString()} missions</span>`}
          ${isNaN(L)?"":`<span>${L.toLocaleString()} m\xB2</span>`}
          ${isNaN(O)?"":`<span>${O.toLocaleString()} h (30 d)</span>`}
        </div>${ee}`:"";Q=`
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${s.lifetimeExpanded}">
          Stats ${s.lifetimeExpanded?"\u25B2":"\u25BC"}
        </button>
        ${ae}
      `}}return`
    <div class="rpc-zone rpc-zone6">
      ${w?"":`<div class="rpc-zone-header">LAST ${i} DAYS</div>`}
      ${w?"":H}
      ${Y}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${p==="coverage"&&e.hasCoverageImage?G:q}
      </div>
      ${$e}
      ${ne}
      ${w?"":Q}
    </div>
  `}function mt(t,n){return Math.min(100,Math.max(0,Math.round(t/n*100)))}function ht(t,n){return n==="battery"?t>20?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)":n==="tank"?t>40?"var(--rpc-green)":t>20?"var(--rpc-amber)":"var(--rpc-red)":t>50?"var(--rpc-green)":t>10?"var(--rpc-amber)":"var(--rpc-red)"}function Vt(t,n){let e=n/90;if(!e)return"";let r=t/e;return r>1.2?"\u2191":r<.8?"\u2193":"\u2192"}function gt(t){let n=parseInt(t,10);return!isNaN(n)&&n>=0?`~${n} use${n!==1?"s":""} remaining`:t==="Empty"?"Bag full \u2014 replace soon":t==="Full"?"Bag has capacity":h(t)}function vt(t){return t>=80?"var(--rpc-green)":t>=60?"var(--rpc-amber)":"var(--rpc-red)"}function Zt(t){return t>=80?"GOOD":t>=60?"FAIR":"NEEDS ATTENTION"}function qt(t,n,e,r){if(!n.hasRobotHealthScore)return"";let s=t.states[`sensor.${e}_robot_health_score`];if(!s)return"";if(s.state==="unknown"||s.state==="unavailable")return`
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating\u2026 (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
        ${r?"Hide details \u25B2":"Show details \u25BC"}
      </button>
    `;let o=Math.round(parseFloat(s.state));if(isNaN(o))return"";let i=vt(o),c=Zt(o),d=s.attributes?.status_text,p=s.attributes?.recommendation,l=d?`<div class="rpc-health-plain-status">${h(d)}${p?`<div class="rpc-health-recommendation">${h(p)}</div>`:""}</div>`:"";return`
    <div class="rpc-health-score" aria-label="Robot health ${o} out of 100, ${c}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${i}">${o}</span>
      <span class="rpc-health-score-band" style="color:${i}">\u25CF ${c}</span>
      ${Kt(t,e)}
    </div>
    ${l}
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${r}">
      ${r?"Hide details \u25B2":"Show details \u25BC"}
    </button>
  `}function Kt(t,n){let e=t.states[`sensor.${n}_health_score_trend`];if(!e)return"";if(e.state==="improving"||e.state==="stable"||e.state==="declining"){let a={improving:{icon:"\u2197",colour:"var(--rpc-green, #4ade80)",label:"improving"},stable:{icon:"\u2192",colour:"var(--secondary-text-color)",label:"stable"},declining:{icon:"\u2198",colour:"#d97706",label:"declining"}}[e.state];return`<span class="rpc-health-trend" style="color:${a.colour}" aria-label="Health trend: ${a.label}">${a.icon} ${a.label}</span>`}let r=e.attributes?.days_until_ready;return typeof r=="number"&&r>0?`<span class="rpc-health-trend rpc-health-trend--calibrating">trend in ~${r}d</span>`:""}function Ut(t,n){let e=t.states[`sensor.${n}_consecutive_mission_anomalies`];if(!e)return"";let r=Number(e.state);return!Number.isFinite(r)||r<3?"":`
    <div class="rpc-anomaly-banner" role="alert">
      \u26A0 Last ${r} missions were anomalous \u2014 check brushes and filter
    </div>
  `}function Yt(t,n,e,r){if(!n.hasNavStats)return"";let s=l=>{let u=t.states[`sensor.${e}_${l}`];if(!u||u.state==="unknown"||u.state==="unavailable")return null;let v=Number(u.state);return Number.isFinite(v)?v:null},a=s("nav_quality"),o=s("nav_panics"),i=s("nav_landmark_quality"),c=s("nav_good_landmarks");if(a===null&&o===null&&i===null&&c===null)return"";let d=a!==null?`<span class="rpc-nav-score-value" style="color:${vt(a)}">${Math.round(a)}</span><span class="rpc-nav-score-max">/100</span>`:'<span class="rpc-nav-score-value rpc-nav-score--na">\u2014</span>',p=[];return o!==null&&p.push(`<div class="rpc-nav-factor" title="How often navigation failed and the robot had to recover">
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
  `}function Gt(t,n,e,r){if(!n.hasMaintenanceCalendar)return"";let s=[{key:"wheel",label:"Wheels",entityId:`sensor.${e}_wheel_last_cleaned`,service:"roomba_plus.reset_wheel_cleaning"},{key:"contact",label:"Contacts",entityId:`sensor.${e}_contact_last_cleaned`,service:"roomba_plus.reset_contact_cleaning"},{key:"bin",label:"Bin",entityId:`sensor.${e}_bin_last_cleaned`,service:"roomba_plus.reset_bin_cleaning"}].filter(o=>!!t.states[o.entityId]);return s.length===0?"":`
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${s.map(o=>{let i=t.states[o.entityId],c=r.openMaintPopover===o.key,p=i.state!=="unavailable"&&i.state!=="unknown"?`Cleaned ${X(i.state,t.language)}`:"Never recorded";return`
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
  `}function Xt(t,n){let e=p=>{let l=t.states[p];if(!l||l.state==="unknown"||l.state==="unavailable")return null;let u=parseFloat(l.state);return isNaN(u)?null:u},r=e(`sensor.${n}_dock_tank_level`),s=e(`sensor.${n}_dock_knockoffs`),a=e(`sensor.${n}_dock_charge_aborts`),o=e(`sensor.${n}_dock_contact_chatters`);if(r===null&&s===null&&a===null&&o===null)return"";let i=r!==null?`<div class="rpc-dock-tank">Tank level ${Math.round(r)}%</div>`:"",c=[s!==null?`${s.toLocaleString()} knockoffs`:"",a!==null?`${a.toLocaleString()} charge aborts`:"",o!==null?`${o.toLocaleString()} contact chatters`:""].filter(Boolean),d=c.length?`<div class="rpc-dock-counters">${c.join(" \xB7 ")} <span class="rpc-dock-lifetime-note">(lifetime)</span></div>`:"";return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-dock-health">
      <div class="rpc-dock-label">DOCK</div>
      ${i}
      ${d}
    </div>
  `}function Jt(t,n,e,r){if(!n.hasRoomsOverdue)return"";let s=t.states[`sensor.${e}_rooms_overdue`];if(!s||s.state==="unknown"||s.state==="unavailable")return"";let a=s.attributes??{},o=a.rooms??{},i=Array.isArray(a.overdue_rooms)?a.overdue_rooms:[],c=Array.isArray(a.daily_suggested)?a.daily_suggested:[],d;i.length===0?d='<div class="rpc-rooms-overdue-row rpc-rooms-overdue-row--muted">All rooms in rhythm</div>':d=i.map(v=>{let w=o[v];if(!w)return"";let g=Math.round(w.days_since_last),b=w.expected_interval_days!=null?Math.round(w.expected_interval_days):null,T=b!=null?` (expected ~${b}d)`:"";return`<div class="rpc-rooms-overdue-row">${h(v)} \u2014 ${g}d since last clean${T}</div>`}).join("");let p=c.length>0?`<div class="rpc-rooms-overdue-daily">${c.map(h).join(", ")} could use daily cleaning</div>`:"",l=r.resetting==="overdue-clean",u=i.length>0?`
    <button class="rpc-btn rpc-btn-secondary rpc-rooms-overdue-btn${l?" rpc-btn-loading":""}"
            data-reset="overdue-clean" data-service="clean_overdue_rooms"
            ${l?"disabled":""}>
      ${l?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Clean overdue"}
    </button>
    ${r.resetError==="overdue-clean"?`<div class="rpc-send-error">Couldn't start \u2014 try again</div>`:""}
  `:"";return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-rooms-overdue">
      <div class="rpc-dock-label">ROOMS</div>
      ${d}
      ${p}
      ${u}
    </div>
  `}function Qt(t,n,e){if(!n.hasDirtCorrelation)return"";let r=t.states[`sensor.${e}_dirt_weather_correlation`];if(!r||r.state==="unavailable")return"";let s=r.attributes??{},a=s.by_entity??{},o=s.strongest_entity??null,i=p=>t.states[p]?.attributes?.friendly_name??p,c,d=o?a[o]:void 0;if(o&&d?.r!=null)c=`<div class="rpc-dirt-corr-row">Strongest link: ${h(i(o))} (r = ${d.r.toFixed(2)})</div>`;else{let p=Object.entries(a);p.length===0?c='<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">Collecting data\u2026</div>':c=p.map(([l,u])=>{let v=typeof u?.n=="number"?u.n:0;return`<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">${h(i(l))}: ${v}/30 missions</div>`}).join("")}return`
    <div class="rpc-health-divider"></div>
    <div class="rpc-dirt-corr">
      <div class="rpc-dock-label">DIRT CORRELATION</div>
      ${c}
    </div>
  `}function bt(t,n,e,r,s){if(n.show_health===!1)return"";let a=r,o=[];t.states[`sensor.${a}_filter_remaining_hours`]&&o.push({key:"filter",label:"Filter",sensorId:`sensor.${a}_filter_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${a}_filter_wear_rate`:void 0,resetService:"reset_filter",lastReplacedId:`sensor.${a}_filter_last_replaced`}),e.hasBrush&&t.states[`sensor.${a}_brush_remaining_hours`]&&o.push({key:"brush",label:"Brush",sensorId:`sensor.${a}_brush_remaining_hours`,thresholdAttr:"threshold_hours",type:"consumable",wearSensorId:e.hasWearRate?`sensor.${a}_brush_wear_rate`:void 0,resetService:"reset_brush",lastReplacedId:`sensor.${a}_brush_last_replaced`}),e.hasPad&&t.states[`sensor.${a}_pad_days_until_due`]&&o.push({key:"pad",label:"Pad",sensorId:`sensor.${a}_pad_days_until_due`,thresholdAttr:"threshold_days",type:"consumable",unit:"d",wearSensorId:e.hasWearRate?`sensor.${a}_pad_wear_rate`:void 0,resetService:"reset_pad",lastReplacedId:`sensor.${a}_pad_last_replaced`}),e.hasWater&&t.states[`sensor.${a}_mop_tank_level`]&&o.push({key:"tank",label:"Tank",sensorId:`sensor.${a}_mop_tank_level`,thresholdAttr:null,type:"tank"});let i=t.states[`sensor.${a}_battery`]?`sensor.${a}_battery`:null,c=i?void 0:t.states[`vacuum.${a}`]?.attributes?.battery_level;(i||c!==void 0)&&o.push({key:"battery",label:"Battery",sensorId:i??"",thresholdAttr:null,type:"battery",rawPct:c}),e.hasCleanBase&&t.states[`sensor.${a}_clean_base_status`]&&o.push({key:"cleanbase",label:"Clean Base",sensorId:`sensor.${a}_clean_base_status`,thresholdAttr:null,type:"cleanbase"});let d=Ut(t,a),p=Yt(t,e,a,s.navDetailsExpanded),l="";{let f=t.states[`vacuum.${a}`],$=!!f&&(f.state==="error"||!!f.attributes?.error_code),y=t.states[`sensor.${a}_last_error_code`];if(!$&&y&&y.state!=="0"&&y.state!==""&&y.state!=="unknown"&&y.state!=="unavailable"){let E=h(y.attributes.label??`Error ${y.state}`),H=t.states[`sensor.${a}_last_error_at`]?.state,A=H&&H!=="unknown"&&H!=="unavailable"?X(H,t.language):"";l=`
        <div class="rpc-last-error-info">Last error: ${E}${A?` \xB7 ${h(A)} (resolved)`:" (resolved)"}</div>
      `}}let u=Xt(t,a),v=Jt(t,e,a,s),w=Qt(t,e,a);if(o.length===0&&!e.hasRobotHealthScore&&!e.hasMaintenanceCalendar&&!d&&!p&&!e.hasBatteryRetention&&!e.hasCoveragePct&&!l&&!u&&!v&&!w)return"";let g=o.map(f=>er(f,t,a,s)).join(""),b="";if(e.hasBatteryRetention){let f=t.states[`sensor.${a}_battery_capacity_retention`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let $=Math.round(parseFloat(f.state));if(!isNaN($)){let y=$>85?"var(--rpc-green)":$>70?"var(--rpc-amber)":"var(--rpc-red)",E=t.states[`sensor.${a}_battery_cycles`],H=E?parseInt(E.state,10):NaN,A=isNaN(H)?"":`${H} charge cycle${H!==1?"s":""}`,Y="";if(e.hasBatteryEol){let Q=t.states[`sensor.${a}_estimated_battery_eol`];if(Q&&Q.state!=="unavailable"&&Q.state!=="unknown"){let I=parseInt(Q.state,10);isNaN(I)||(Y=I>0?`<div class="rpc-retention-eol">Battery life: ~${I} days remaining</div>`:'<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing \u2014 battery at end of life</div>')}}let G=s.openPopover==="retention",q=s.resetting==="retention",ne=G?`
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">\xD7</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${$}% of original capacity</div>
              ${A?`<div class="rpc-popover-sub">${A}</div>`:""}
              ${Y}
            </div>
            <button class="rpc-btn rpc-btn-secondary${q?" rpc-btn-loading":""}"
                    data-reset="retention" data-service="reset_battery"
                    ${q?"disabled":""}>
              ${q?'<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':"Mark as replaced"}
            </button>
            ${s.resetError==="retention"?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
          </div>`:"";b=`
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${G}" tabindex="0"
               aria-label="Bat. Health \u2014 ${$}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${$}%;background:${y}"></div></div>
            <span class="rpc-bar-pct" style="color:${y}">${$}%</span>
            <span class="rpc-bar-hours"></span>
          </div>
          ${ne}`}}}let T="";if(e.hasCoveragePct){let f=t.states[`sensor.${a}_recent_coverage_pct`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let $=t.states[`sensor.${a}_missions_last_30d`],y=$?parseInt($.state,10):NaN;if(isNaN(y)||y<10)T=`
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history\u2026</span>
          </div>`;else{let E=Math.min(100,Math.round(parseFloat(f.state)));if(!isNaN(E)){let H=E>=85?"var(--rpc-green)":E>=65?"var(--rpc-amber)":"var(--rpc-red)",A=s.openPopover==="coverage",Y=isNaN(y)?"":`Based on ${y} mission${y!==1?"s":""} in the last 30 days.`,G=A?`
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">\xD7</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${E}% of floor area covered on the last mission.</div>
                ${Y?`<div class="rpc-popover-sub">${Y}</div>`:""}
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
            ${G}`}}}}let P=b||T?`<div class="rpc-health-battery-sep"></div>${b}${T}`:"",x="";if(e.hasEnergyConsumption){let f=t.states[`sensor.${a}_total_energy_consumed`];if(f&&f.state!=="unavailable"&&f.state!=="unknown"){let $=parseFloat(f.state);if(!isNaN($)){let y=t.states[`sensor.${a}_battery_cycles`],E=y?parseInt(y.state,10):NaN,H=s.openPopover==="energy",A=H?`
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
          </div>`:"";x=`
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${H}" tabindex="0"
               aria-label="Lifetime energy ~${$.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${$.toFixed(1)} kWh lifetime</span>
          </div>
          ${A}`}}}let R="";if(e.isMop){let f=t.states[`sensor.${a}_mop_pad`],$=e.hasMopBehavior?t.states[`sensor.${a}_mop_behavior`]:null,y=[];f&&f.state!=="unknown"&&f.state!=="unavailable"&&y.push(h(f.state)),$&&$.state!=="unknown"&&$.state!=="unavailable"&&y.push(`${h($.state)} intensity`),y.length&&(R=`
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${y.join(" \xB7 ")}</div>
      `)}return`
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${d}
      ${l}
      ${qt(t,e,a,s.healthDetailsExpanded)}
      ${e.hasRobotHealthScore&&!s.healthDetailsExpanded?"":`
        ${g}
        ${P}
        ${x}
        ${R}
        ${u}
        ${v}
        ${w}
      `}
      ${Gt(t,e,a,s)}
      ${p}
    </div>
  `}function er(t,n,e,r){let s=r.openPopover===t.key;if(t.type==="cleanbase"){let u=n.states[t.sensorId];return u?`
      <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${s}" tabindex="0"
           aria-label="${t.label}">
        <span class="rpc-bar-label">${t.label}</span>
        <span class="rpc-bar-cleanbase-state">${gt(u.state)}</span>
      </div>
      ${s?rr(t.label,u.state):""}
    `:""}let a=0,o="",i="",c=null;if(t.rawPct!==void 0)a=Math.min(100,Math.max(0,t.rawPct)),o=`${Math.round(a)}%`;else{let u=n.states[t.sensorId];if(!u)return"";let v=parseFloat(u.state);if(isNaN(v))return"";if(t.type==="tank"||t.type==="battery")a=Math.min(100,Math.max(0,v)),o=`${Math.round(a)}%`;else{if(c=t.thresholdAttr?u.attributes[t.thresholdAttr]:null,!c)return"";a=mt(v,c),o=`${a}%`,i=`${Math.round(v)}h`}}let d=ht(a,t.type),p="";if(t.wearSensorId&&c){let u=n.states[t.wearSensorId];u&&u.state!=="unknown"&&u.state!=="unavailable"&&(p=Vt(parseFloat(u.state),c))}let l=t.rawPct!==void 0?{state:String(Math.round(t.rawPct)),attributes:{}}:n.states[t.sensorId];return`
    <div class="rpc-bar-row" data-bar="${t.key}" role="button" aria-expanded="${s}" tabindex="0"
         aria-label="${t.label} \u2014 ${o}">
      <span class="rpc-bar-label">${t.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${a}%;background:${d}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${d}">${o}</span>
      ${i?`<span class="rpc-bar-hours">${i}</span>`:""}
      ${p?`<span class="rpc-bar-arrow" style="color:${d}">${p}</span>`:""}
    </div>
    ${s&&l?tr(t,l,c,n,r):""}
  `}function tr(t,n,e,r,s){let a=parseFloat(n.state),o=e?mt(a,e):Math.min(100,Math.max(0,a)),i=ht(o,t.type),c=s.resetting===t.key,d=t.lastReplacedId?r.states[t.lastReplacedId]:null,p="";d&&d.state!=="unavailable"&&d.state!=="unknown"&&(p=`
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${new Date(d.state).toLocaleDateString(r.language)} (${X(d.state,r.language)})</span>
      </div>`);let l="";if(t.wearSensorId&&!s.legendShown){let v=r.states[t.wearSensorId];v&&v.state!=="unknown"&&v.state!=="unavailable"&&(l=`
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
      ${e?`<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(a)} ${t.unit??"h"} (${o}%)</span></div>`:""}
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
        ${s.resetError===t.key?'<div class="rpc-send-error">Reset failed \u2014 try again</div>':""}
      `:""}
    </div>
  `}function rr(t,n){return`
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${h(t)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">\xD7</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${gt(n)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `}function ft(t,n){if(!t||t==="unavailable"||t==="unknown")return"No schedule set";try{let e=new Date(t);return e.toLocaleDateString(n,{weekday:"short"})+" "+e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return h(t)}}function nr(t,n){if(!t||t==="unavailable"||t==="unknown")return"";try{let e=new Date(t);if(isNaN(e.getTime()))return"";let r=e.toLocaleDateString(n,{weekday:"short"}),s=e.toLocaleTimeString(n,{hour:"2-digit",minute:"2-digit",hour12:!1});return`${r} ~${s}`}catch{return""}}function yt(t,n,e,r,s){if(n.show_schedule===!1)return"";let a=r,o=t.states[`sensor.${a}_next_clean`],i=t.states[`binary_sensor.${a}_schedule_hold_active`],c=t.states[`sensor.${a}_presence_clean_opportunities_7d`],d=t.states[`sensor.${a}_presence_clean_utilisation_7d`],p=t.states[`sensor.${a}_next_likely_clean_window`],l=!!c&&!!d&&c.state!=="unknown"&&c.state!=="unavailable"&&d.state!=="unknown"&&d.state!=="unavailable",u=!!p&&p.state!=="unknown"&&p.state!=="unavailable";if(!o&&!i&&!l&&!u&&!e.hasOptimalWindow)return"";let v="";if(i){let x=i.state==="on",f=i.attributes.source==="presence_manager",$="rpc-badge-green",y="Schedule active",E="";x&&(f?($="rpc-badge-blue",y="Away hold",E="\u{1F3C3}"):($="rpc-badge-amber",y="Hold active",E="\u{1F512}")),v=`
      <button class="rpc-hold-badge ${$}"
              data-hold-action="${f?"tooltip":"toggle"}"
              aria-label="${h(y)}">
        ${s.holdToggling?'<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>':`${E} ${y}`}
      </button>
      ${s.holdTooltipVisible?`
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation \u2014 controlled automatically
        </div>`:""}
    `}let w="";if(u){let x=nr(p.state,t.language);x&&(w=`
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${x}</span>
        </div>
      `)}let g="";if(e.hasOptimalWindow){let x=t.states[`sensor.${a}_optimal_clean_window`];if(x&&x.state!=="unavailable"&&x.state!=="unknown"){let R=ft(x.state,t.language);R&&R!=="No schedule set"&&(g=`
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${R}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">\u2605</span>
            </span>
          </div>`)}}let b="",T=n.presence_entities??[];if(T.length>0){let x=T.map(R=>{let f=t.states[R];if(!f)return"";let $=f.state==="home",y=f.attributes.friendly_name??R,E=h(y.split(" ")[0]);return`<span class="rpc-presence-dot">
        <span class="rpc-dot ${$?"rpc-dot-amber":"rpc-dot-green"}" aria-hidden="true"></span>
        ${E}
        <span class="rpc-presence-label">${$?"home":"away"}</span>
      </span>`}).join("");x&&(b=`<div class="rpc-presence-row">${x}</div>`)}let P="";if(l){let x=parseInt(c.state,10),R=parseInt(d.state,10);if(!isNaN(x)&&!isNaN(R)){let f=d.attributes.cleans_7d,$=f??Math.round(x*R/100),y=`${x} opportunit${x!==1?"ies":"y"} this week`;P=`
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${`${$} clean${$!==1?"s":""}`} \xB7 ${y}
        </div>
      `}}return`
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${o?`
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${ft(o.state,t.language)}</span>
            </div>`:""}
          ${w}
          ${g}
        </div>
        ${v}
      </div>
      ${b}
      ${P}
    </div>
  `}function ar(t,n){let e=`button.${n}_fav_`;return Object.keys(t.states).filter(r=>r.startsWith(e)).sort()}function sr(t,n,e){let r=t.states[n]?.attributes?.friendly_name?.trim();if(r){let a=t.states[`vacuum.${e}`]?.attributes?.friendly_name?.trim();return a&&r.startsWith(a+" ")?r.slice(a.length+1):r}return n.replace(`button.${e}_fav_`,"").split("_").map(a=>a&&a[0].toUpperCase()+a.slice(1)).join(" ")}function _t(t,n,e){let r=ar(t,e);return r.length===0?"":`
    <div class="rpc-settings-divider"></div>
    <div class="rpc-fav-section">
      <div class="rpc-fav-label">Favourites</div>
      <div class="rpc-fav-row">${r.map(a=>{let o=h(sr(t,a,e));return`<button class="rpc-fav-btn" data-fav-entity="${h(a)}" aria-label="${o}">\u2605 ${o}</button>`}).join("")}</div>
    </div>
  `}function xt(t,n){let{hass:e,config:r,caps:s,robotName:a,isMetric:o}=n;switch(t){case"map":return Pe(e,r,s,a,{data:n.missionData,loading:n.historyLoading,error:n.historyError,openDay:n.openDay,dayMissions:n.dayMissions,openDaySummary:n.openDaySummary,openExplain:n.openExplain,openReplay:n.openReplay,openMissionMap:n.openMissionMap,lifetimeExpanded:n.lifetimeExpanded,historyTab:"coverage",hazards:n.hazards,mapSelectedRooms:n.selectedRooms,suppressSubTabToggle:!0,isMapContext:!0},o);case"history":return Pe(e,r,s,a,{data:n.missionData,loading:n.historyLoading,error:n.historyError,openDay:n.openDay,dayMissions:n.dayMissions,openDaySummary:n.openDaySummary,openExplain:n.openExplain,openReplay:n.openReplay,openMissionMap:n.openMissionMap,lifetimeExpanded:n.lifetimeExpanded,historyTab:r.mode==="companion"?n.historyTab:"calendar",hazards:n.hazards,suppressSubTabToggle:r.mode!=="companion"},o);case"health":return`
          ${n.alertZoneHtml}
          ${bt(e,r,s,a,{openPopover:n.openPopover,resetting:n.resetting,resetError:n.resetError,legendShown:n.legendShown,healthDetailsExpanded:n.healthDetailsExpanded,openMaintPopover:n.openMaintPopover,navDetailsExpanded:n.navDetailsExpanded})}
        `;case"settings":return`
          ${yt(e,r,s,a,{holdTooltipVisible:n.holdTooltipVisible,holdToggling:n.holdToggling})}
          <div class="rpc-settings-divider"></div>
          ${Re(e,r,a,n.settingsPanelOpen)}
          ${r.mode!=="companion"?we({hass:e,config:r,caps:s,robotName:a,selectedRooms:n.selectedRooms,passes:n.passes,isSending:n.isSendingClean,sendError:n.sendError,settingsPanelOpen:n.settingsPanelOpen,includeSettingsPanel:!1}):""}
          ${n.maintenanceLinksHtml}
          ${_t(e,r,a)}
        `;default:return""}}function $t(t){return or.has(t)}var or=new Set(["room","tab","household-back","room-overlay","close","health-details-toggle","nav-details-toggle","maint","close-maint","close-day","settings-toggle","lifetime-toggle","history-tab","bar","heatmap-cell"]);function wt(t,n,e={}){switch(t){case"room":{let r=e.room;return n.selectedRooms.has(r)?n.selectedRooms.delete(r):n.selectedRooms.add(r),{selectedRooms:n.selectedRooms}}case"room-overlay":{let r=e.room;return r?(n.selectedRooms.has(r)?n.selectedRooms.delete(r):n.selectedRooms.add(r),{selectedRooms:n.selectedRooms}):{}}case"tab":{let r=e.tab??null;return r===n.activeTab?{}:{activeTab:r}}case"household-back":return{viewMode:"robot"};case"close":return{openPopover:null};case"health-details-toggle":return{healthDetailsExpanded:!n.healthDetailsExpanded};case"nav-details-toggle":return{navDetailsExpanded:!n.navDetailsExpanded};case"maint":{let r=e.maint;return{openMaintPopover:n.openMaintPopover===r?null:r}}case"close-maint":return{openMaintPopover:null};case"close-day":return{openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null};case"settings-toggle":return{settingsPanelOpen:!n.settingsPanelOpen};case"lifetime-toggle":return{lifetimeExpanded:!n.lifetimeExpanded};case"history-tab":return{historyTab:e.historyTab,openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null};case"bar":{let r=e.bar;return{openPopover:n.openPopover===r?null:r,resetError:null}}case"heatmap-cell":{let r=e.date;return n.openDay===r?{openDay:null,dayMissions:null,openDaySummary:null,openExplain:null,openReplay:null,openMissionMap:null}:{openDay:r,openDaySummary:e.daySummaryForDate??null,dayMissions:e.dayMissionsForDate??null,openExplain:null,openReplay:null,openMissionMap:null}}}}var ir={start:["vacuum","start"],pause:["vacuum","pause"],resume:["vacuum","start"],return_home:["vacuum","return_to_base"],locate:["vacuum","locate"],stop:["vacuum","stop"],retry:["vacuum","start"]};function kt(t){if(t==="clean-selected")return{kind:"clean-selected"};if(t==="repeat-last")return{kind:"repeat-last"};if(t==="toggle-room-picker")return{kind:"toggle-room-picker"};let n=ir[t];if(!n)return{kind:"noop"};let[e,r]=n;return{kind:"vacuum",domain:e,service:r,action:t,pulse:t==="locate"}}var Ct=`
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
`,De=class extends HTMLElement{constructor(){super();this.robotName="";this.activeRobot="";this.missionEventUnsub=null;this.missionEventSubscribing=!1;this.activeTab=null;this.roomPickerOpen=!1;this.viewMode="robot";this.selectedRooms=new Set;this.passes="Auto";this.passSettingInFlight=!1;this.isSendingClean=!1;this.sendError=null;this.settingsPanelOpen=!1;this.loadingAction=null;this.locateTimer=null;this.actionResetTimer=null;this.cleanTimeoutTimer=null;this.openPopover=null;this.resetting=null;this.resetError=null;this.legendShown=!1;this.healthDetailsExpanded=!1;this.navDetailsExpanded=!1;this.openMaintPopover=null;this.holdTooltipVisible=!1;this.holdToggling=!1;this.holdTooltipTimer=null;this.alertsVisible=!1;this.lastAlertHtml="";this.alertCollapseTimer=null;this.missionData=null;this.firstRecord=null;this.firstSummary=null;this.historyLoading=!1;this.historyError=null;this.openDay=null;this.dayMissions=null;this.openDaySummary=null;this.openExplain=null;this.openReplay=null;this.openMissionMap=null;this.lifetimeExpanded=!1;this.hazards=[];this.historyTab="calendar";this.householdData=null;this.apiClient=null;this.prevVacuumState="";this.prevMissionActive="";this.handleOutsideClick=e=>{if(!e.composedPath().includes(this)){let s=!1;this.openPopover!==null&&(this.openPopover=null,s=!0),this.openMaintPopover!==null&&(this.openMaintPopover=null,s=!0),this.openDay!==null&&(this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.openExplain=null,this.openReplay=null,this.openMissionMap=null,s=!0),s&&this.render()}};this.handleDelegatedClick=e=>{let r=e.target,s=st(r);s&&(e.stopPropagation(),this.dispatchClick(s.key,s.el))};this.handleDelegatedChange=e=>{let r=e.target?.closest("[data-robot-select]");if(!r)return;e.stopPropagation();let s=r.value;s==="__household__"?(this.viewMode="household",this.render()):(this.viewMode="robot",this.switchRobot(s))};this.handleDelegatedKeydown=e=>{let r=e;if(r.key!=="Enter"&&r.key!==" ")return;let s=ot(e.target);s&&(e.preventDefault(),e.stopPropagation(),this.dispatchClick(s.key,s.el))};this.root=this.attachShadow({mode:"open"})}connectedCallback(){document.addEventListener("click",this.handleOutsideClick),this.root.addEventListener("click",this.handleDelegatedClick),this.root.addEventListener("change",this.handleDelegatedChange),this.root.addEventListener("keydown",this.handleDelegatedKeydown)}disconnectedCallback(){document.removeEventListener("click",this.handleOutsideClick),this.root.removeEventListener("click",this.handleDelegatedClick),this.root.removeEventListener("change",this.handleDelegatedChange),this.root.removeEventListener("keydown",this.handleDelegatedKeydown),this.missionEventUnsub&&(this.missionEventUnsub().catch(()=>{}),this.missionEventUnsub=null),this.missionEventSubscribing=!1,this.clearAllTimers()}clearAllTimers(){[this.locateTimer,this.actionResetTimer,this.cleanTimeoutTimer,this.holdTooltipTimer,this.alertCollapseTimer].forEach(e=>{e!==null&&clearTimeout(e)}),this.locateTimer=this.actionResetTimer=this.cleanTimeoutTimer=null,this.holdTooltipTimer=this.alertCollapseTimer=null}setConfig(e){let r=e.entities&&e.entities.length>0?e.entities:[e.entity];if(!r[0])throw new Error("roomba-plus-card: entity is required");let s=this.activeRobot,a=r.includes(s)?s:r[0],o=a!==s;this.config=e,this.activeRobot=a,this.robotName=a.replace("vacuum.",""),o&&this.resetRobotState(),this.root.innerHTML=`<style>${Ct}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading\u2026</div>`}set hass(e){let r=this.relevantEntityIds(),s=!this._hass||r.some(d=>e.states[d]?.state!==this._hass.states[d]?.state||e.states[d]?.last_changed!==this._hass.states[d]?.last_changed),a=this._hass;this._hass=e;let o=e.states[`select.${this.robotName}_cleaning_passes`];o&&!this.isSendingClean&&!this.passSettingInFlight&&(this.passes=Le[o.state]??"Auto");let i=`binary_sensor.${this.robotName}_mission_active`,c=e.states[i]?.state??"";if(c)this.prevMissionActive==="on"&&c==="off"&&this.loadHistory(),this.prevMissionActive=c;else{let d=e.states[this.activeRobot]?.state??"";this.prevVacuumState==="cleaning"&&d==="docked"&&this.loadHistory(),this.prevVacuumState=d}this.apiClient===null?this.config.show_history!==!1&&(this.apiClient=new xe(e,this.config,this.activeRobot),this.loadHistory()):this.apiClient.updateHass(e),this.maybeSubscribeMissionEvents(),(!a||s)&&this.render()}relevantEntityIds(){let e=this.robotName;return[this.activeRobot,`sensor.${e}_last_error_code`,`sensor.${e}_last_error_zone`,`sensor.${e}_last_error_at`,`sensor.${e}_health_score_trend`,`binary_sensor.${e}_layout_change_detected`,`sensor.${e}_optical_dirt_detections`,`sensor.${e}_piezo_dirt_detections`,`sensor.${e}_scrubs_count`,`sensor.${e}_dock_tank_level`,`sensor.${e}_dock_knockoffs`,`sensor.${e}_dock_charge_aborts`,`sensor.${e}_dock_contact_chatters`,`sensor.${e}_rooms_overdue`,`sensor.${e}_dirt_weather_correlation`,`sensor.${e}_phase`,`binary_sensor.${e}_mission_active`,`binary_sensor.${e}_maintenance_due`,`sensor.${e}_readiness`,`binary_sensor.${e}_schedule_hold_active`,`sensor.${e}_next_clean`,`sensor.${e}_filter_remaining_hours`,`sensor.${e}_brush_remaining_hours`,`sensor.${e}_mop_pad`,`sensor.${e}_mop_tank_level`,`sensor.${e}_mop_behavior`,`sensor.${e}_clean_base_status`,`sensor.${e}_nav_quality`,`sensor.${e}_nav_panics`,`sensor.${e}_nav_landmark_quality`,`sensor.${e}_nav_good_landmarks`,`sensor.${e}_next_likely_clean_window`,`sensor.${e}_presence_clean_opportunities_7d`,`sensor.${e}_presence_clean_utilisation_7d`,`sensor.${e}_cleaning_passes`,`select.${e}_cleaning_passes`,`select.${e}_smart_zone_select`,`select.${e}_zone_select`,`sensor.${e}_clean_streak`,`sensor.${e}_completion_rate_30d`,`sensor.${e}_lifetime_missions`,`sensor.${e}_cleaning_analytics_30d`,`sensor.${e}_battery_capacity_retention`,`sensor.${e}_estimated_battery_eol`,`sensor.${e}_wifi_health`,`sensor.${e}_recent_coverage_pct`,`sensor.${e}_missions_last_30d`,`sensor.${e}_average_mission_time`,`sensor.${e}_cleaning_performance`,`binary_sensor.${e}_consecutive_clean_skips`,`sensor.${e}_area_cleaned_today`,`sensor.${e}_mission_expire_time`,`image.${e}_coverage_map`,`image.${e}_map`,`sensor.${e}_robot_health_score`,`sensor.${e}_wheel_last_cleaned`,`sensor.${e}_contact_last_cleaned`,`sensor.${e}_bin_last_cleaned`,`sensor.${e}_battery_last_replaced`,`sensor.${e}_mission_progress`,`sensor.${e}_last_mission_result`,`sensor.${e}_consecutive_mission_anomalies`,`select.${e}_carpet_boost_select`,`switch.${e}_edge_clean`,`switch.${e}_always_finish`,`binary_sensor.${e}_demand_clean_blocked`,`sensor.${e}_optimal_clean_window`,`binary_sensor.${e}_cloud_connected`,`binary_sensor.${e}_mqtt_stale`,`sensor.${e}_firmware_version`,`device_tracker.${e}_position`,...this.config.robot_selector_helper?[this.config.robot_selector_helper]:[]]}entityList(){return this.config.entities&&this.config.entities.length>0?this.config.entities:[this.config.entity]}resetRobotState(){this.apiClient=null,this.missionData=null,this.firstRecord=null,this.firstSummary=null,this.historyLoading=!1,this.historyError=null,this.selectedRooms=new Set,this.passes="Auto",this.passSettingInFlight=!1,this.openPopover=null,this.legendShown=!1,this.healthDetailsExpanded=!1,this.openMaintPopover=null,this.activeTab=null,this.roomPickerOpen=!1,this.openDay=null,this.dayMissions=null,this.openDaySummary=null,this.openExplain=null,this.openReplay=null,this.openMissionMap=null,this.settingsPanelOpen=!1,this.lifetimeExpanded=!1,this.hazards=[],this.historyTab="calendar",this.householdData=null,this.prevVacuumState="",this.prevMissionActive="",this.alertsVisible=!1,this.lastAlertHtml="",this.clearAllTimers()}async switchRobot(e){if(e===this.activeRobot)return;this.activeRobot=e,this.robotName=e.replace("vacuum.",""),this.resetRobotState(),this.config.show_history!==!1&&this._hass&&(this.apiClient=new xe(this._hass,this.config,e),this.loadHistory()),this.render();let r=this.config.robot_selector_helper;if(r&&this._hass.states[r]){let s=r.split(".")[0],a=s==="input_select"?"select_option":"set_value",o=s==="input_select"?{entity_id:r,option:e}:{entity_id:r,value:e};try{await this._hass.callService(s,a,o)}catch(i){console.warn("roomba-plus-card: robot_selector_helper write failed",i)}}}maybeSubscribeMissionEvents(){if(this.missionEventUnsub||this.missionEventSubscribing)return;let e=this._hass?.connection;!e||!this.apiClient||(this.missionEventSubscribing=!0,e.subscribeMessage(r=>{this.onMissionCompletedEvent(r?.data?.entry_id)},{type:"subscribe_events",event_type:"roomba_plus_mission_completed"}).then(r=>{this.missionEventUnsub=r,this.missionEventSubscribing=!1}).catch(()=>{this.missionEventSubscribing=!1}))}async onMissionCompletedEvent(e){if(!this.apiClient)return;let r=null;try{r=await this.apiClient.getEntryId()}catch{r=null}lt(r,e)&&this.loadHistory()}async loadHistory(){if(!this.apiClient||this.historyLoading)return;let e=this.activeRobot;this.historyLoading=!0,this.historyError=null,this.render();try{let r=this.config.history_days??28,s=await this.apiClient.fetchSummary(r),a=await this.apiClient.fetchRecords(r);if(a.length>0){let c=new Map;for(let d of a){let p=d.started_at.slice(0,10);c.has(p)||c.set(p,[]),c.get(p).push(d)}for(let d of s){let p=c.get(d.date);p&&(d.missions=p.sort((l,u)=>l.started_at.localeCompare(u.started_at)))}}let o=await this.apiClient.fetchHazards(),i=(this.config.entities?.length??0)>=2?await this.apiClient.fetchHousehold(r):null;this.missionData=s,this.firstRecord=a.length>0?a[a.length-1]:null,this.firstSummary=s.length>0?s[s.length-1]:null,this.hazards=o,this.householdData=i}catch(r){let s=r.message;this.historyError=s==="404"?"History requires Roomba+ v1.8 or later":"History temporarily unavailable"}finally{if(this.activeRobot!==e)return;this.historyLoading=!1,this.render()}}render(){if(!this.config||!this._hass)return;let e=Se(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=this._hass.config?.unit_system?.length==="m",s=new Date,a=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`,i=(this.missionData?.find(P=>P.date===a)??null)?.total??null;this.activeTab===null&&(this.activeTab=He(this.config,e));let c=tt(this.config,e);c.some(P=>P.id===this.activeTab)||(this.activeTab=He(this.config,e));let d=Xe(this._hass,this.config,e,this.robotName),p=d;d?(this.alertCollapseTimer!==null&&(clearTimeout(this.alertCollapseTimer),this.alertCollapseTimer=null),this.alertsVisible=!0,this.lastAlertHtml=d):this.alertsVisible&&(this.alertCollapseTimer===null&&(this.alertCollapseTimer=setTimeout(()=>{this.alertsVisible=!1,this.alertCollapseTimer=null,this.render()},100)),p=this.lastAlertHtml);let l=et({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,loadingAction:this.loadingAction,todayMissionCount:i,missionData:this.missionData,roomPickerOpen:this.roomPickerOpen,selectedRoomCount:this.selectedRooms.size,activeRobot:this.activeRobot}),u=this.roomPickerOpen?we({hass:this._hass,config:this.config,caps:e,robotName:this.robotName,selectedRooms:this.selectedRooms,passes:this.passes,isSending:this.isSendingClean,sendError:this.sendError,settingsPanelOpen:!1}):"",v={health:rt(this._hass,e,this.robotName),history:nt(this._hass,e,this.robotName)},w=at(c,this.activeTab,v),g=xt(this.activeTab,{hass:this._hass,config:this.config,caps:e,robotName:this.robotName,isMetric:r,missionData:this.missionData,historyLoading:this.historyLoading,historyError:this.historyError,openDay:this.openDay,dayMissions:this.dayMissions,openDaySummary:this.openDaySummary,openExplain:this.openExplain,openReplay:this.openReplay,openMissionMap:this.openMissionMap,lifetimeExpanded:this.lifetimeExpanded,historyTab:this.historyTab,hazards:this.hazards,selectedRooms:this.selectedRooms,openPopover:this.openPopover,resetting:this.resetting,resetError:this.resetError,legendShown:this.legendShown,healthDetailsExpanded:this.healthDetailsExpanded,openMaintPopover:this.openMaintPopover,navDetailsExpanded:this.navDetailsExpanded,holdTooltipVisible:this.holdTooltipVisible,holdToggling:this.holdToggling,settingsPanelOpen:this.settingsPanelOpen,isSendingClean:this.isSendingClean,sendError:this.sendError,passes:this.passes,maintenanceLinksHtml:this.renderMaintenanceLinks(e),alertZoneHtml:p}),b=this.viewMode==="household"?`
        <button class="rpc-household-back" data-household-back>\u2190 Back</button>
        ${Je(this._hass,this.config,e,this.householdData,r)}
      `:`
        ${l}
        ${u}
        ${w}
        <div class="rpc-tab-panel">
          ${g}
        </div>
      `,T=`
      <style>${Ct}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${b}
      </div>
    `;this.root.innerHTML=T}renderMaintenanceLinks(e){if(!e.hasMaintenanceCalendar&&!this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`])return"";let r=this.robotName,s=[];return this._hass.states[`sensor.${r}_wheel_last_cleaned`]&&s.push({label:"Wheel cleaning",service:"roomba_plus.reset_wheel_cleaning",tsEntityId:`sensor.${r}_wheel_last_cleaned`}),this._hass.states[`sensor.${r}_contact_last_cleaned`]&&s.push({label:"Contact cleaning",service:"roomba_plus.reset_contact_cleaning",tsEntityId:`sensor.${r}_contact_last_cleaned`}),this._hass.states[`sensor.${r}_bin_last_cleaned`]&&s.push({label:"Bin cleaning",service:"roomba_plus.reset_bin_cleaning",tsEntityId:`sensor.${r}_bin_last_cleaned`}),this._hass.states[`sensor.${r}_battery_capacity_retention`]&&s.push({label:"Battery baseline",service:"roomba_plus.reset_battery",tsEntityId:`sensor.${r}_battery_last_replaced`}),s.length===0?"":`
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${s.map(a=>{let o=this._hass.states[a.tsEntityId],c=!!o&&o.state!=="unavailable"&&o.state!=="unknown"?`Reset ${X(o.state,this._hass.language)}`:"Never recorded";return`
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${a.label}</span>
            <span class="rpc-maint-link-service">${a.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${c}</div>
        `}).join("")}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools \u2192 Services</div>
    `}renderRobotSelectorBar(){let e=this.entityList();if(e.length<2)return"";let r=e.map(a=>{let o=this._hass.states[a]?.attributes?.friendly_name??a,i=this.viewMode==="robot"&&a===this.activeRobot?" selected":"";return`<option value="${a}"${i}>${o}</option>`}).join(""),s=this.viewMode==="household"?" selected":"";return`
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${r}</optgroup>
          <optgroup label="View">
            <option value="__household__"${s}>\u{1F4CA} Household summary</option>
          </optgroup>
        </select>
      </div>`}dispatchClick(e,r){let s=r.dataset;if($t(e)){let a={room:s.room??s.roomPoly??s.roomLabel,tab:s.tab,bar:s.bar,maint:s.maint,historyTab:s.historyTab};if(e==="heatmap-cell"){let i=r.getAttribute("data-date");a.date=i,this.openDay!==i&&(a.daySummaryForDate=this.missionData?.find(c=>c.date===i)??null,a.dayMissionsForDate=this.buildDayMissions(i))}let o=wt(e,this,a);Object.assign(this,o),this.render(),e==="bar"&&!this.legendShown&&this.root.querySelector("[data-wear-legend]")&&(this.legendShown=!0);return}switch(e){case"action":this.handleAction(s.action);return;case"pass":{let a=s.pass,o=s.passOption;this.passes=a,this.render();let i=`select.${this.robotName}_cleaning_passes`;this._hass.states[i]&&(this.passSettingInFlight=!0,this._hass.callService("select","select_option",{entity_id:i,option:o}).catch(()=>{}).finally(()=>{this.passSettingInFlight=!1}));return}case"reset":{let a=s.reset,o=s.service;this.resetting=a,this.resetError=null,this.render(),(async()=>{try{await this._hass.callService("roomba_plus",o,{entity_id:this.activeRobot}),await new Promise(i=>setTimeout(i,800)),this.openPopover===a&&(this.openPopover=null)}catch{this.resetError=a}finally{this.resetting=null,this.render()}})();return}case"hold-action":{if(s.holdAction==="tooltip")this.holdTooltipVisible=!0,this.render(),this.holdTooltipTimer!==null&&clearTimeout(this.holdTooltipTimer),this.holdTooltipTimer=setTimeout(()=>{this.holdTooltipVisible=!1,this.holdTooltipTimer=null,this.render()},3e3);else{let a=`switch.${this.robotName}_schedule_hold`,o=this._hass.states[a]?.state==="on";this.holdToggling=!0,this.render(),this._hass.callService("switch",o?"turn_off":"turn_on",{entity_id:a}).catch(()=>{}).finally(()=>{this.holdToggling=!1,this.render()})}return}case"switch-entity":{let a=s.switchEntity,o=this._hass.states[a]?.state==="on";this._hass.callService("switch",o?"turn_off":"turn_on",{entity_id:a}).catch(()=>{});return}case"cycle-entity":{let a=s.cycleEntity,o=[];try{o=JSON.parse(s.cycleOptions??"[]")}catch{o=[]}let i=s.cycleCurrent??"",c=o.indexOf(i),d=o.length>0?o[(c+1)%o.length]:null;d&&this._hass.callService("select","select_option",{entity_id:a,option:d}).catch(()=>{});return}case"fav-entity":{let a=s.favEntity;this._hass.callService("button","press",{entity_id:a}).catch(()=>{});return}case"replay":{let a=parseInt(r.getAttribute("data-replay"),10);if(this.openReplay?.nMssn===a){this.openReplay=null,this.render();return}if(!this.apiClient){this.openReplay={nMssn:a,data:null,error:!0},this.render();return}this.openReplay={nMssn:a,data:null},this.render(),this.apiClient.fetchPath(a).then(o=>{this.openReplay?.nMssn===a&&(this.openReplay=o===null?{nMssn:a,data:null,error:!0}:{nMssn:a,data:o},this.render())}).catch(()=>{this.openReplay?.nMssn===a&&(this.openReplay={nMssn:a,data:null,error:!0},this.render())});return}case"map":{let a=r.getAttribute("data-map");if(this.openMissionMap?.recordId===a){this.openMissionMap=null,this.render();return}if(!this.apiClient){this.openMissionMap={recordId:a,data:null,status:"error"},this.render();return}this.openMissionMap={recordId:a,data:null},this.render(),this.apiClient.fetchMissionMap(a).then(o=>{this.openMissionMap?.recordId===a&&(this.openMissionMap=o.status==="ok"?{recordId:a,data:o.data}:{recordId:a,data:null,status:o.status},this.render())}).catch(()=>{this.openMissionMap?.recordId===a&&(this.openMissionMap={recordId:a,data:null,status:"error"},this.render())});return}case"explain":{let a=r.getAttribute("data-explain");if(this.openExplain?.missionId===a){this.openExplain=null,this.render();return}if(!this.apiClient){this.openExplain={missionId:a,data:null,error:!0},this.render();return}this.openExplain={missionId:a,data:null},this.render(),this.apiClient.fetchExplain(a).then(o=>{this.openExplain?.missionId===a&&(this.openExplain=o===null?{missionId:a,data:null,error:!0}:{missionId:a,data:o},this.render())}).catch(()=>{this.openExplain?.missionId===a&&(this.openExplain={missionId:a,data:null,error:!0},this.render())});return}}}buildDayMissions(e){let r=this.missionData?.find(s=>s.date===e);return!r||r.total===0?[]:r.missions&&r.missions.length>0?r.missions:[]}async handleAction(e){let r=kt(e);switch(r.kind){case"toggle-room-picker":this.roomPickerOpen=!this.roomPickerOpen,this.render();return;case"clean-selected":return this.runCleanSelected();case"repeat-last":return this.runRepeatLast();case"vacuum":return this.runVacuumAction(r.domain,r.service,r.action,r.pulse);case"noop":return}}async runCleanSelected(){let e=this.activeRobot,r=this.robotName;this.isSendingClean=!0,this.sendError=null,this.render();let s=Array.from(this.selectedRooms);this.cleanTimeoutTimer=setTimeout(()=>{this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app",this.cleanTimeoutTimer=null,this.render()},8e3);try{let a=`select.${r}_cleaning_passes`;this.passes!=="Auto"&&this._hass.states[a]&&await this._hass.callService("select","select_option",{entity_id:a,option:Me[this.passes]??this.passes}),await this._hass.callService("roomba_plus","clean_room",{entity_id:e,room_name:s,ordered:!1}),clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null,this.selectedRooms.clear(),this.isSendingClean=!1}catch{this.cleanTimeoutTimer!==null&&(clearTimeout(this.cleanTimeoutTimer),this.cleanTimeoutTimer=null),this.isSendingClean=!1,this.sendError="Start command may not have been received \u2014 check the iRobot app"}this.render()}async runRepeatLast(){let e=this.robotName;try{await this._hass.callService("button","press",{entity_id:`button.${e}_repeat_mission`})}catch{}}async runVacuumAction(e,r,s,a){let o=this.activeRobot;if(this.loadingAction=s,this.render(),a){this.locateTimer=setTimeout(()=>{this.loadingAction=null,this.locateTimer=null,this.render()},2e3);try{await this._hass.callService(e,r,{entity_id:o})}catch{}return}this.actionResetTimer=setTimeout(()=>{this.loadingAction=null,this.actionResetTimer=null,this.render()},5e3);try{await this._hass.callService(e,r,{entity_id:o})}finally{this.actionResetTimer!==null&&(clearTimeout(this.actionResetTimer),this.actionResetTimer=null),this.loadingAction=null,this.render()}}getCardSize(){if(!this.config||!this._hass)return 10;let e=Se(this._hass,this.robotName,this.config,this.firstRecord,this.firstSummary),r=4;return e.hasSmartZones&&this.config.show_rooms!==!1&&(r+=3),this.config.show_health!==!1&&(r+=2),this.config.show_schedule!==!1&&(r+=2),this.config.show_history!==!1&&(r+=4),r}static getConfigForm(){return{schema:it()}}static getStubConfig(){return{entity:"vacuum.roomba"}}};typeof customElements<"u"&&customElements.define("roomba-plus-card",De);typeof window<"u"&&(window.customCards??(window.customCards=[]),window.customCards.push({type:"roomba-plus-card",name:"Roomba+ Card",description:"Full-featured card for the roomba_plus integration",preview:!0,documentationURL:"https://github.com/johnnyh1975/ha_roomba_plus_card"}));
