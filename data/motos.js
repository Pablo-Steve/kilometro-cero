/* Base de datos de MOTOS (una línea = una generación).
   marca|modelo|generación|años|tipo|precio usado €(min-max)|etiquetas|descripción|fallos propios (;)|versiones (~)
   versión: nombre,cv,par Nm,código motor,peso en orden de marcha kg,0-100 s,vel. máx,consumo l/100,transmisión final (C cadena, K cardán, B correa),caja (M5,M6,DCT,CVT)
   tipos: naked, sport, trail, custom, scooter, touring, motard, retro
   etiquetas extra de motos: a2 (A2 directa: hasta 35 kW / 47,5 cv), a2l (tiene versión limitada para A2), 125 (con carnet B y 3 años de antigüedad se puede llevar en España) */
window.MOTOS_TXT = `
Yamaha|MT-07|RM04-RM33|2014-hoy|naked|4500-8000|a2l,dep,fiab,barato,novel,urb|La naked de media cilindrada más vendida: ligera, con mucho par y diversión inmediata. Ideal para A2.|Suspensión básica (horquilla blanda en frenadas fuertes);Kit de arrastre;Regulador de corriente en 2014-2015;Corrosión en tornillería|MT-07,73,68,CP2,182,3.9,214,4.2,C,M6~MT-07 A2,47.5,59,CP2,182,4.8,180,4.0,C,M6
Yamaha|MT-09|RN29-RN69|2013-hoy|naked|6000-11500|a2l,dep,tun|Tricilíndrico CP3 con muchísimo par y carácter gamberro. Fácil de levantar de delante.|Inyección brusca en primeras unidades (2013-2016);Suspensión blanda;Retenes de horquilla;Cadena|MT-09,119,93,CP3,193,3.4,230,5.6,C,M6~MT-09 SP,119,93,CP3,190,3.3,230,5.6,C,M6
Yamaha|MT-03|RH07-RH17|2016-hoy|naked|3500-6000|a2,novel,urb,fiab,barato|Naked ligera A2 directa. Perfecta para aprender y para la sierra sin miedo.|Pocos fallos; vigilar caídas|MT-03,42,29.6,Y321,168,5.6,180,4.0,C,M6
Yamaha|MT-10|RN45|2016-hoy|naked|10000-15000|dep,circ|El motor crossplane del R1 en una naked. Brutal.|Consumo alto;Calor;Depósito pequeño|MT-10,166,112,YCP4,210,3.0,250,7.0,C,M6
Yamaha|MT-125|RE29|2014-hoy|naked|2500-4500|125,novel,urb,efic|125 de aspecto grande. Primera moto con carnet B.|Pocos|MT-125,15,11.5,Y125,140,10.5,115,2.4,C,M6
Yamaha|YZF-R1|RN32-RN65|2015-hoy|sport|11000-20000|dep,circ|Superbike con electrónica de MotoGP y motor crossplane.|Mantenimiento caro;Calor|R1,200,113,YCP4,201,2.9,299,7.5,C,M6
Yamaha|YZF-R1|RN09-RN22|2002-2014|sport|4500-9000|dep,circ,clas|Superbike con sonido único; desde 2009 crossplane.|Regulador;Tensor de cadena de distribución;Neumáticos|R1 2004,172,107,YCP4,195,3.0,290,7.5,C,M6~R1 2009,182,116,YCP4,206,3.0,290,8.0,C,M6
Yamaha|YZF-R6|RJ11-RJ27|2006-2020|sport|5000-11000|dep,circ|Supersport de 600 cc que gira a 16.000 rpm. Exige mucho para ir rápido.|Holgura de válvulas;Motores castigados en circuito;Poco par abajo|R6,129,66,YCP4,190,3.4,262,6.5,C,M6
Yamaha|YZF-R7|RM39|2021-hoy|sport|7000-9500|a2l,dep,circ,novel|Deportiva carenada con el motor de la MT-07. Accesible y muy divertida.|Postura exigente para ir a diario|R7,73,67,CP2,188,3.8,220,4.3,C,M6
Yamaha|YZF-R3|RH07-RH12|2015-hoy|sport|3800-6500|a2,novel,dep,fiab|Deportiva A2 de 42 cv: la mejor forma de aprender a tumbar.|Pocos|R3,42,29.6,Y321,169,5.6,180,4.0,C,M6
Yamaha|YZF-R125|RE06-RE40|2008-hoy|sport|2500-5500|125,novel,dep|La deportiva de 125 por excelencia.|Embrague en uso de escuela|R125,15,11.5,Y125,144,10.5,120,2.6,C,M6
Yamaha|Tracer 7|RM14-RM34|2016-hoy|touring|6000-10000|a2l,ruta,fiab,prac|Trail de asfalto con motor CP2: cómoda, económica y fiable.|Pantalla pequeña;Suspensión simple|Tracer 7,73,67,CP2,196,4.0,210,4.3,C,M6
Yamaha|Tracer 9 GT|RN43-RN71|2015-hoy|touring|9000-15000|ruta,dep,conf|Sport-tourer con tricilíndrico de 119 cv y equipamiento completo.|Retenes de horquilla;Electrónica|Tracer 9 GT,119,93,CP3,220,3.5,230,5.9,C,M6
Yamaha|Ténéré 700|DM08|2019-hoy|trail|8000-11500|a2l,off,ruta,fiab|Trail de verdad para pistas: sencilla, fiable y sin electrónica sobrante.|Altura de asiento (875 mm);Regulador|Ténéré 700,73,68,CP2,204,4.5,190,4.3,C,M6
Yamaha|XSR700|RM22|2016-hoy|retro|5500-8500|a2l,clas,novel|Estética neoclásica con motor MT-07.|Pocos|XSR700,73,68,CP2,186,3.9,200,4.3,C,M6
Yamaha|XSR900|RN46-RN69|2016-hoy|retro|8000-12000|dep,clas|Retro con espíritu de deportiva de los 80 y motor CP3.|Inyección brusca en primeras|XSR900,119,93,CP3,193,3.4,230,5.6,C,M6
Yamaha|TMAX|SJ-12|2001-hoy|scooter|5000-13000|urb,ruta,conf|El rey de los maxiscooters: chasis de moto y bicilíndrico de 560 cc.|Correa de transmisión;Variador|TMAX 560,47,55.7,SCOOT,220,5.4,165,4.8,B,CVT
Yamaha|XMAX 300|SG42|2017-hoy|scooter|3500-6500|a2,urb,efic|Scooter de 300 cc versátil: ciudad y escapadas.|Rodillos del variador|XMAX 300,28,29,SCOOT,180,9.0,140,3.0,B,CVT
Kawasaki|Z650|ER650H-K|2017-hoy|naked|4500-8000|a2l,novel,fiab,barato|Naked ligera y suave, la principal rival de la MT-07.|Pocos; suspensión sencilla|Z650,68,64,K649,187,4.0,205,4.4,C,M6~Z650 A2,47.5,56,K649,187,4.8,180,4.2,C,M6
Kawasaki|ER-6n|ER650A-C|2006-2016|naked|2500-4500|a2l,barato,fiab,novel|Antecesora de la Z650: muy fiable y barata de segunda mano.|Regulador de corriente;Óxido en tornillería|ER-6n,72,66,K649,204,4.1,210,4.6,C,M6
Kawasaki|Z900|ZR900B-F|2017-hoy|naked|7000-10500|a2l,dep,fiab|Cuatro cilindros de 125 cv, sonido de los de antes y precio contenido. Tiene versión A2 de 70 kW limitada a 35 kW.|Pocos; suspensión básica|Z900,125,98.6,KZ900,210,3.0,240,5.8,C,M6~Z900 A2,95,83,KZ900,210,3.6,215,5.5,C,M6
Kawasaki|Z900RS|ZR900C|2018-hoy|retro|9500-13500|clas,dep,fiab|Homenaje a la Z1 de los 70 con motor moderno.|Pocos|Z900RS,111,98.5,KZ900,215,3.4,225,5.9,C,M6
Kawasaki|Z400 / Z500|ER400D-ER500|2019-hoy|naked|4000-6500|a2,novel,fiab|A2 directa con bicilíndrico alegre.|Pocos|Z400,45,38,K399,167,5.0,190,4.0,C,M6~Z500,45,42.6,K399,167,4.8,190,4.0,C,M6
Kawasaki|Ninja 650|EX650|2017-hoy|sport|5000-8000|a2l,novel,ruta,fiab|Deportiva de postura cómoda: carretera y viajes.|Pocos|Ninja 650,68,64,K649,193,4.0,210,4.4,C,M6
Kawasaki|Ninja 400 / 500|EX400-EX500|2018-hoy|sport|4000-6500|a2,novel,dep|Pequeña deportiva A2 muy bien resuelta.|Pocos|Ninja 400,45,38,K399,168,5.0,190,4.0,C,M6
Kawasaki|Ninja ZX-6R|ZX636|2007-hoy|sport|5000-12000|dep,circ|Supersport con 636 cc: más par que las 600 rivales.|Regulador;Uso en circuito|ZX-6R,130,70.8,KZX6,196,3.2,262,6.5,C,M6
Kawasaki|Ninja ZX-10R|ZXT00|2011-hoy|sport|8000-18000|dep,circ|Superbike multicampeona de WorldSBK.|Mantenimiento de deportiva|ZX-10R,203,114,KZX10,207,2.9,299,7.5,C,M6
Kawasaki|Versys 650|LE650|2007-hoy|touring|4500-9000|a2l,ruta,fiab,prac|Trail de asfalto incombustible, con postura cómoda y consumo bajo.|Pocos|Versys 650,69,61,K649,219,4.2,200,4.6,C,M6
Honda|CB650R|RH02|2019-hoy|naked|6500-9500|a2l,dep,fiab|"Neo Sports Café": cuatro cilindros suave y elegante, limitable a A2.|Pocos|CB650R,95,64,HCB650,202,3.6,225,5.0,C,M6
Honda|CB500F / CB500 Hornet|PC45-PC64|2013-hoy|naked|3500-6500|a2,novel,fiab,barato,efic|A2 directa de las más fiables del mercado.|Pocos|CB500F,48,43,H471,189,5.4,185,3.6,C,M6
Honda|CBR650R / F|RH03|2014-hoy|sport|6000-10000|a2l,dep,fiab,ruta|Deportiva de cuatro cilindros y postura razonable.|Pocos|CBR650R,95,63,HCB650,208,3.6,230,5.0,C,M6
Honda|CBR500R|PC44-PC64|2013-hoy|sport|4000-7000|a2,novel,fiab|Deportiva A2 muy fiable.|Pocos|CBR500R,48,43,H471,192,5.4,185,3.6,C,M6
Honda|CBR600RR|PC37-PC40|2003-2024|sport|4000-10000|dep,circ,fiab|Supersport mítica de Honda. Fiable incluso en circuito.|Regulador de corriente;Motores castigados|CBR600RR,120,66,HCBR600,186,3.2,260,6.4,C,M6
Honda|CBR1000RR Fireblade|SC57-SC77|2004-hoy|sport|6000-25000|dep,circ,fiab|Superbike equilibrada: la Fireblade.|Regulador|Fireblade 2008,178,112,HCBR1000,199,3.0,290,7.0,C,M6~Fireblade SP 2020,217,113,HCBR1000,201,2.8,299,7.5,C,M6
Honda|CB750 Hornet|RH12|2023-hoy|naked|7500-9000|a2l,dep|Hornet moderna con bicilíndrico a 270°.|Muy nueva|CB750 Hornet,92,75,H750T,190,3.4,215,4.6,C,M6
Honda|Hornet 600|PC34-PC41|1998-2013|naked|2000-4500|a2l,clas,barato,dep|La naked de 600 de los 2000: motor de CBR600 con 100 cv.|Regulador de corriente;Óxido en escape|Hornet 600,102,64,HCBR600,200,3.4,230,6.0,C,M6
Honda|NC750X|RC90-RH09|2014-hoy|trail|5000-9500|a2l,efic,ruta,fiab,prac|Consume como un scooter y tiene un hueco de casco donde iría el depósito. Opción DCT automática.|Pocos|NC750X,58,69,HNC750,214,5.0,185,3.5,C,M6~NC750X DCT,58,69,HNC750,224,5.0,185,3.5,C,DCT
Honda|X-ADV|RC95-RH10|2017-hoy|scooter|8000-12500|a2l,urb,ruta,off|Mezcla de scooter y trail con caja DCT.|Pocos|X-ADV,58,69,HNC750,236,5.0,180,3.6,C,DCT
Honda|Africa Twin|SD04-SD10|2016-hoy|trail|9000-17000|off,ruta,fiab|Trail grande con capacidades off-road reales.|Peso|CRF1100L,102,105,HAT1100,226,3.9,200,5.0,C,M6
Honda|XL750 Transalp|RD16|2023-hoy|trail|9000-10500|a2l,off,ruta|Trail media versátil y ligera.|Muy nueva|Transalp,92,75,H750T,208,3.9,200,4.4,C,M6
Honda|CB125R|JC79-JC91|2018-hoy|naked|3000-4500|125,novel,urb|125 premium de diseño cuidado.|Pocos|CB125R,15,11.6,H125,130,11.0,115,2.2,C,M6
Honda|PCX 125|JF56-JK05|2010-hoy|scooter|1800-3800|125,urb,efic,fiab|Scooter 125 de consumo bajísimo (2 l/100).|Correa del variador|PCX 125,12.5,11.8,H125,130,12.0,105,2.1,B,CVT
Honda|Rebel 500|PC56|2017-hoy|custom|5000-7000|a2,novel,clas|Custom bobber ligera y baja. Fácil para cualquiera.|Pocos|Rebel 500,46,43,H471,191,6.0,170,3.6,C,M6
KTM|390 Duke|JGJ-JPJ|2013-hoy|naked|3500-6500|a2,dep,novel,urb|Monocilíndrico explosivo y chasis de deportiva en 150 kg. Muy divertida en curvas cerradas.|Regulador/rectificador;Electrónica;Vibraciones|390 Duke,44,37,KTM390,165,4.9,170,3.6,C,M6
KTM|125 Duke|JGA|2011-hoy|naked|2500-4500|125,novel,dep|La 125 con mejor chasis.|Embrague;Electrónica|125 Duke,15,12,KTM125,149,9.5,120,2.5,C,M6
KTM|790 / 890 Duke|TU1-TU5|2018-hoy|naked|7000-11000|a2l,dep,circ|"The Scalpel": ligera y precisa, perfecta para la sierra.|Calentamiento en atasco;Bomba de agua;Electrónica|790 Duke,105,87,LC8C,187,3.2,225,5.0,C,M6~890 Duke R,121,99,LC8C,186,3.0,235,5.2,C,M6
KTM|1290 Super Duke R|EVO|2014-hoy|naked|11000-19000|dep,circ|"The Beast": 180 cv en una naked. Para expertos.|Consumo;Neumáticos|1290 Super Duke R,180,140,LC8,212,2.8,270,7.0,C,M6
KTM|690 SMC R|LC4|2012-hoy|motard|6500-10500|a2l,dep,urb|Supermotard de 74 cv: rueda en el aire y curvas cerradas.|Bomba de combustible;Mantenimiento frecuente|690 SMC R,74,73.5,KTM390,160,4.0,180,4.5,C,M6
KTM|890 Adventure|TU8|2020-hoy|trail|9500-14000|off,ruta,dep|Trail ligera y muy capaz fuera del asfalto.|Calentamiento;Electrónica|890 Adventure,105,100,LC8C,210,3.5,210,5.2,C,M6
Husqvarna|Svartpilen / Vitpilen 401|HQ401|2018-hoy|retro|3800-6500|a2,novel,clas,urb|Estética escandinava y mecánica KTM 390.|Mismos que KTM 390|Svartpilen 401,44,37,KTM390,160,4.9,170,3.6,C,M6
Triumph|Street Triple 765|RS/R|2017-hoy|naked|8500-14000|a2l,dep,circ|Tricilíndrico con motor de Moto2: precisa, rápida y con sonido adictivo.|Regulador;Electrónica|Street Triple R,118,80,T765,189,3.3,240,5.4,C,M6~Street Triple RS,130,80,T765,187,3.1,250,5.6,C,M6
Triumph|Street Triple 675|D67LD|2007-2016|naked|4000-7500|a2l,dep,barato|La Street Triple original: 106 cv y agilidad tremenda.|Regulador de corriente;Reglaje de válvulas|Street Triple 675,106,68,T765,189,3.5,225,5.5,C,M6
Triumph|Trident 660|H1|2021-hoy|naked|6000-8500|a2l,novel,dep|Tricilíndrico accesible y muy limitable para A2.|Pocos|Trident 660,81,64,T660,189,3.6,215,4.7,C,M6
Triumph|Speed Triple 1200 RS|DS12|2021-hoy|naked|14000-19000|dep,circ|180 cv de tricilíndrico en una naked de lujo.|Primeras unidades con llamadas a revisión|Speed Triple RS,180,125,T1160,198,2.8,260,6.5,C,M6
Triumph|Speed Twin / Bonneville|DR|2016-hoy|retro|7500-12500|clas,ruta|Clásica británica con motor moderno.|Pocos|Speed Twin 1200,100,112,T1200,216,3.8,215,5.4,C,M6~Bonneville T120,80,105,T1200,236,4.5,200,4.8,C,M6
Triumph|Tiger Sport 660|H2|2022-hoy|touring|7000-9500|a2l,ruta|Sport-tourer ligera con motor de la Trident.|Pocos|Tiger Sport 660,81,64,T660,206,3.8,205,4.7,C,M6
Ducati|Monster|821-937|2014-hoy|naked|7000-12000|a2l,dep|El icono naked de Ducati, ahora con chasis monocasco y más ligera.|Correas y reglaje desmo caros;Regulador|Monster 821,109,86,TSD,206,3.4,230,5.4,C,M6~Monster 937,111,93,TSD,188,3.3,230,5.5,C,M6
Ducati|Monster|696-1100|2008-2014|naked|3500-7000|a2l,clas,dep|Monster clásica refrigerada por aire.|Correas de distribución;Embrague en seco;Regulador|Monster 696,80,69,DESMODUE,185,3.9,210,5.0,C,M6~Monster 1100 EVO,100,103,DESMODUE,188,3.5,230,5.6,C,M6
Ducati|Scrambler 800|K1-3G|2015-hoy|retro|6000-9500|a2l,clas,urb|Retro californiana, fácil y llena de estilo.|Correas desmo;Acabados|Scrambler Icon,73,67,DESMODUE,189,4.2,195,5.0,C,M6
Ducati|Panigale V4|1H|2018-hoy|sport|17000-30000|dep,circ,lujo|Superbike de 215 cv con motor derivado de MotoGP.|Calor;Mantenimiento muy caro|Panigale V4,215,123,DV4,198,2.6,299,7.5,C,M6
Ducati|Streetfighter V4|1H|2020-hoy|naked|16000-23000|dep,circ,lujo|Panigale V4 desnuda con aletas.|Calor;Mantenimiento|Streetfighter V4,208,123,DV4,201,2.7,280,7.5,C,M6
Ducati|Multistrada V2/950|AA|2017-hoy|touring|10000-15000|ruta,dep,conf|Trail de asfalto deportiva para viajar rápido.|Correas;Electrónica|Multistrada 950,113,96,TSD,227,3.5,220,5.6,C,M6
Suzuki|SV650|AV|1999-hoy|naked|2500-7500|a2l,fiab,barato,novel,dep|V2 incombustible con chasis noble. Una de las mejores motos para aprender.|Regulador en antiguas;Suspensión básica;Óxido en tornillería|SV650,76,64,SV650,198,3.7,210,4.3,C,M6
Suzuki|GSX-8S|EM1|2023-hoy|naked|8000-9500|a2l,dep|Bicilíndrico a 270° con electrónica completa.|Muy nueva|GSX-8S,83,78,S776,202,3.6,220,4.3,C,M6
Suzuki|GSX-S750|C5|2017-2021|naked|5500-8000|a2l,dep|Naked de cuatro cilindros con motor de GSX-R.|Pocos|GSX-S750,114,81,SGSX,213,3.4,225,5.5,C,M6
Suzuki|GSX-S1000|GT79|2015-hoy|naked|7000-13000|dep|Naked con motor de GSX-R1000 K5. Mucho par y sonido de los buenos.|Pocos|GSX-S1000,152,106,SGSX,214,3.1,250,6.4,C,M6
Suzuki|GSX-R750|K4-L1|2004-2016|sport|4000-9000|dep,circ,clas|La única 750 superdeportiva que sobrevivió: potencia de 1000 con peso de 600.|Regulador;Tensor de cadena de distribución|GSX-R750,150,86,SGSX,190,3.0,280,6.5,C,M6
Suzuki|GSX-R1000|K5-K8|2005-2008|sport|4500-8000|dep,circ,clas|La K5 es leyenda: motor brutal y chasis noble.|Regulador;Embrague;Motores castigados|GSX-R1000 K5,178,118,SGSX,202,3.0,299,7.0,C,M6
Suzuki|V-Strom 650|DL650|2004-hoy|trail|3500-8500|a2l,ruta,fiab,barato|"Wee-Strom": económica, fiable y cómoda para viajar a cualquier lado.|Pocos|V-Strom 650,71,62,SV650,213,4.2,195,4.6,C,M6
BMW|R 1250 GS|K50|2019-2023|trail|14000-22000|ruta,off,conf,lujo|La reina de las trails: bóxer ShiftCam y cardán.|Juntas del cardán;Electrónica;Embrague en uso pesado|R 1250 GS,136,143,BMWBOX,249,3.6,220,4.8,K,M6
BMW|R 1200 GS|K25-K50|2004-2018|trail|6000-14000|ruta,off,conf|La trail más vendida del mundo durante años.|Junta del cardán final;Sensores;Fugas en el embrague (K25)|R 1200 GS LC,125,125,BMWBOX,244,3.8,210,5.0,K,M6
BMW|S 1000 RR|K46-K67|2009-hoy|sport|10000-25000|dep,circ|Superbike de más de 200 cv con electrónica punta.|Llamada a revisión de bielas (2019-2020);Mantenimiento|S 1000 RR,207,113,BMWS1000,197,2.8,299,6.4,C,M6
BMW|S 1000 R|K47-K63|2014-hoy|naked|8000-16000|dep|Naked de la RR, muy refinada.|Pocos|S 1000 R,165,114,BMWS1000,199,3.1,250,6.4,C,M6
BMW|F 900 R|K83|2020-hoy|naked|7000-10000|a2l,dep,ruta|Naked de bicilíndrico con buen equilibrio.|Pocos|F 900 R,105,92,BMWF900,211,3.6,225,4.6,C,M6
BMW|G 310 R|K03|2016-hoy|naked|2500-4500|a2,novel,urb|BMW de entrada para el A2.|Embrague;Acabados|G 310 R,34,28,BMW310,164,6.9,143,3.3,C,M6
BMW|R nineT|K21|2014-hoy|retro|11000-16000|clas,ruta,lujo|Retro bóxer de calidad, muy personalizable.|Pocos|R nineT,110,116,BMWBOX,222,3.6,220,5.4,K,M6
Aprilia|RS 660|KS|2021-hoy|sport|8500-11500|a2l,dep,circ,novel|Deportiva media con electrónica de superbike. Ligera y precisa.|Primeras unidades con fallos electrónicos|RS 660,100,67,APR660,183,3.5,230,4.8,C,M6
Aprilia|Tuono 660|KT|2021-hoy|naked|8000-10500|a2l,dep|Naked semicarenada del RS 660.|Pocos datos|Tuono 660,95,67,APR660,183,3.6,225,4.8,C,M6
Aprilia|Tuono V4|KY|2011-hoy|naked|9000-18000|dep,circ|Naked V4 de 175 cv con un sonido incomparable.|Regulador;Mantenimiento caro|Tuono V4 1100,175,121,APRV4,209,2.9,270,7.5,C,M6
Aprilia|RSV4|RK-KR|2009-hoy|sport|10000-25000|dep,circ|Superbike V4 campeona de WorldSBK.|Mantenimiento;Electrónica|RSV4 1100,217,125,APRV4,202,2.7,299,7.8,C,M6
Harley-Davidson|Sportster|XL883-1200|2004-2021|custom|5000-9500|clas,urb|Custom clásica americana más ligera.|Vibraciones;Correa;Autonomía corta|Iron 883,50,68,HDM8,256,6.0,165,5.0,B,M5~Forty-Eight 1200,67,96,HDM8,252,5.3,175,5.5,B,M5
Harley-Davidson|Street Bob / Fat Bob|Softail M8|2018-hoy|custom|13000-20000|clas,ruta,lujo|Softail moderna con motor Milwaukee-Eight.|Calor del motor;Peso|Street Bob 114,94,155,HDM8,297,4.5,180,5.6,B,M6
Royal Enfield|Interceptor 650|INT|2019-hoy|retro|5000-7000|a2,clas,barato,novel|Clásica británica-india A2 directa, con encanto y precio bajo.|Acabados;Pequeñas fugas|Interceptor 650,47,52,RE650,217,6.0,165,4.2,C,M6~Continental GT 650,47,52,RE650,212,6.0,170,4.2,C,M6
Royal Enfield|Himalayan|411-452|2016-hoy|trail|3500-6000|a2,off,barato,novel|Trail sencilla para pistas y aprender a rodar en tierra.|Acabados;Electricidad|Himalayan 452,40,40,KTM390,196,7.0,150,3.4,C,M6
MV Agusta|Brutale 800|B3|2012-hoy|naked|7500-13000|dep,lujo|Diseño italiano de altura y tricilíndrico agresivo.|Electrónica;Red de servicio;Inyección en primeras|Brutale 800 RR,140,87,MVAGU,175,3.0,245,6.0,C,M6
CFMoto|700CL-X / 800NK|CL|2021-hoy|naked|5000-8500|a2l,barato,novel|Nakeds chinas bien equipadas a buen precio.|Red de servicio;Reventa|700CL-X,75,68,CFM,196,4.0,190,4.5,C,M6~800NK,99,81,CFM,189,3.5,215,5.0,C,M6
Kawasaki|KLX / KX supermotard 300|LX300|2021-hoy|motard|4500-6500|a2,urb,novel|Supermotard ligera A2 directa para ciudad y curvas cerradas.|Pocos|KLX300SM,30,25,K399,138,7.0,140,3.2,C,M6
`;
