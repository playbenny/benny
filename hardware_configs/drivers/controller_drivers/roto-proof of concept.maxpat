{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 1,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 59.0, 107.0, 558.0, 650.0 ],
        "boxes": [
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 418.0, 12.0, 50.0, 22.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 418.0, 44.0, 64.0, 22.0 ],
                    "text": "pack 0 1 1"
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 0,
                    "patching_rect": [ 418.0, 76.0, 119.0, 22.0 ],
                    "text": "ctlout Roto-Control 1"
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 251.0, 126.0, 50.0, 22.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 70.0, -19.0, 29.5, 22.0 ],
                    "text": "60"
                }
            },
            {
                "box": {
                    "code": "function msg_int(cs){\r\n    // query doesn't work:\r\n    // outlet(0,[90,01,02,0,0]);\r\n    let m=0; //set mode\r\n    outlet(0,[90,01,03,0,2,m,0]);\r\n    //start config\r\n    let command = [90,01,04,00,00];\r\n    outlet(0,command);\r\n\r\n    \r\n    //set knob control config:\r\n    /*\r\n    5A 02 07 <CL:2 SI CI CM CC CP NA:2 MN:2 MX:2 CN:0D CS HM IP1 IP2 HS SN:HS*0D>\r\nCL = Command data length, MSB followed by LSB = 001D + (HS * 0D)\r\nSI = Setup index: 00 – 3F\r\nCI = Control index: 00 – 1F\r\nCM = Control Mode: CC-7BIT (00), CC-14BIT (01), NRPN-7BIT (02), NRPN-14-BIT (03)\r\nCC = Control channel: 01 - 10\r\nCP = Control param\r\nNA = Control Mode is NRPN: NRPN address\r\nAll other Control Modes this is unused, set to 0000\r\nMN = Min value, set the MSB to 00 for 7-BIT mode\r\nMX = Max value, set the MSB to 00 for 7-BIT mode\r\nCN = Control name: 0D-byte NULL terminated ASCII string, padded with 00s if needed\r\nCS = CS = Colour scheme: 00 - 52\r\nHM = Haptic mode: KNOB_300 (00), KNOB_N_STEP (01), KNOB_300_CENTRE_INDENT (02)\r\nIP1 = Indent position 1: 00 – 7F, FF if unused, only applies for KNOB_300\r\nIP2 = Indent position 2: 00 – 7F, FF if unused, only applies for KNOB_300\r\nHS = Haptic steps: 02 - 10, only applies for KNOB_N_STEP\r\nSN = An array of HS x 0D-byte NULL terminated ASCII strings, each string padded with 00s if\r\nneeded*/\r\n    let hm = 0;\r\n    let hs = 0;\r\n    let cl = 28 + (hs * 12);\r\n    let cl2 = Math.floor(cl/256);\r\n    cl = cl % 256;\r\n    command = [90,02,07,cl2,cl,0,4,\r\n        0,//cm\r\n        1,1, 0,0, 0,0, 0,127];\r\n    let cname = \"benny\";\r\n    for(let i=0;i<12;i++){\r\n        if(i<cname.length){\r\n            command.push(cname.charCodeAt(i));\r\n        }else{\r\n            command.push(0);\r\n        }\r\n    }\r\n    command.push(0);\r\n    //let cs = 22; //colour scheme 0-52h\r\n    cs = Math.max(0,Math.min(82,cs));\r\n    command.push(cs);\r\n    command.push(0,0,127,0);\r\n    outlet(0,command);\r\n     //end config\r\n    command = [90,01,05,00,00];\r\n    outlet(0,command);\r\n    \r\n    \r\n   \r\n}",
                    "filename": "none",
                    "fontface": 0,
                    "fontname": "<Monospaced>",
                    "fontsize": 12.0,
                    "id": "obj-31",
                    "maxclass": "v8.codebox",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 53.0, 159.0, 534.0, 390.0 ],
                    "saved_object_attributes": {
                        "parameter_enable": 0
                    }
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "int", "" ],
                    "patching_rect": [ 315.0, 71.0, 37.0, 22.0 ],
                    "text": "serial"
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "int", "" ],
                    "patching_rect": [ 19.0, 562.0, 276.0, 22.0 ],
                    "text": "serial f 115200 @databits 8 @parity 0 @stopbits 1"
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "int", "" ],
                    "patching_rect": [ 28.0, 89.0, 279.0, 22.0 ],
                    "text": "serial e 115200 @databits 8 @parity 0 @stopbits 1"
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 157.0, 42.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 19.0, 528.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 120.0, 594.0, 87.0, 22.0 ],
                    "text": "print 6STATUS"
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 28.0, 599.0, 92.0, 22.0 ],
                    "text": "print 6RETURN"
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "items": [ "COM3", ",", "COM5", ",", "COM6", ",", "COM3", ",", "COM5", ",", "COM6", ",", "COM3", ",", "COM5", ",", "COM6", ",", "COM3", ",", "COM5", ",", "COM6", ",", "COM3", ",", "COM5", ",", "COM6", ",", "COM3", ",", "COM5", ",", "COM6" ],
                    "maxclass": "umenu",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "int", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 312.0, 213.0, 100.0, 22.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 312.0, 181.0, 96.0, 22.0 ],
                    "text": "prepend append"
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 312.0, 149.0, 25.0, 22.0 ],
                    "text": "iter"
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 312.0, 117.0, 60.0, 22.0 ],
                    "text": "route port"
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 24.0, 21.0, 29.5, 22.0 ],
                    "text": "1 1"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 315.0, 39.0, 32.0, 22.0 ],
                    "text": "print"
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 69.0, 53.0, 69.0, 22.0 ],
                    "text": "print SEND"
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 24.0, 53.0, 29.5, 22.0 ],
                    "text": "t l l"
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 125.0, 117.0, 81.0, 22.0 ],
                    "text": "print STATUS"
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 33.0, 122.0, 85.0, 22.0 ],
                    "text": "print RETURN"
                }
            },
            {
                "box": {
                    "attr": "poll",
                    "id": "obj-29",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 60.0, 14.0, 150.0, 22.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-8", 0 ],
                    "source": [ "obj-10", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-4", 0 ],
                    "source": [ "obj-11", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-14", 0 ],
                    "source": [ "obj-13", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-19", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-25", 0 ],
                    "source": [ "obj-20", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-24", 0 ],
                    "source": [ "obj-22", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-2", 0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 0 ],
                    "source": [ "obj-24", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-16", 0 ],
                    "source": [ "obj-25", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-17", 0 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-28", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-28", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-24", 0 ],
                    "source": [ "obj-29", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-25", 0 ],
                    "source": [ "obj-31", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-24", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-4", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-29", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-31", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-28", 0 ],
                    "source": [ "obj-9", 0 ]
                }
            }
        ],
        "autosave": 0
    }
}