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
        "rect": [ 229.0, 126.0, 1593.0, 916.0 ],
        "showontab": 1,
        "boxes": [
            {
                "box": {
                    "hidden": 1,
                    "id": "obj-12",
                    "maxclass": "newobj",
                    "numinlets": 0,
                    "numoutlets": 0,
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
                        "rect": [ 0.0, 26.0, 1593.0, 890.0 ],
                        "showontab": 1,
                        "boxes": [
                            {
                                "box": {
                                    "id": "obj-57",
                                    "maxclass": "newobj",
                                    "numinlets": 5,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "signal" ],
                                    "patching_rect": [ 344.0, 280.0, 154.0, 22.0 ],
                                    "text": "abl.device.redux~ @jitter 1."
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-48",
                                    "maxclass": "ezdac~",
                                    "numinlets": 2,
                                    "numoutlets": 0,
                                    "patching_rect": [ 99.0, 333.0, 45.0, 45.0 ]
                                }
                            },
                            {
                                "box": {
                                    "args": [ "smallstep-single.json" ],
                                    "bgmode": 0,
                                    "border": 0,
                                    "clickthrough": 0,
                                    "enablehscroll": 0,
                                    "enablevscroll": 0,
                                    "id": "obj-62",
                                    "lockeddragscroll": 0,
                                    "lockedsize": 0,
                                    "maxclass": "bpatcher",
                                    "name": "smallstep.maxpat",
                                    "numinlets": 0,
                                    "numoutlets": 2,
                                    "offset": [ 0.0, 0.0 ],
                                    "outlettype": [ "", "int" ],
                                    "patching_rect": [ 344.0, 50.0, 217.0, 83.0 ],
                                    "varname": "SmallStep",
                                    "viewvisibility": 1
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-55",
                                    "maxclass": "newobj",
                                    "numinlets": 7,
                                    "numoutlets": 2,
                                    "outlettype": [ "int", "" ],
                                    "patching_rect": [ 344.0, 147.0, 82.0, 22.0 ],
                                    "text": "midiformat"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-38",
                                    "linecount": 5,
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "signal" ],
                                    "patching_rect": [ 344.0, 185.0, 154.0, 76.0 ],
                                    "text": "abl.device.drift~ @env1decay 0.1 @env1sustain 0. @env1release 0.1 @voicemode 1"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-36",
                                    "maxclass": "comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 54.0, 50.0, 170.0, 20.0 ],
                                    "text": "M4L Device Parameter Styling"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-34",
                                    "maxclass": "newobj",
                                    "numinlets": 7,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
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
                                        "rect": [ 0.0, 0.0, 1000.0, 780.0 ],
                                        "boxes": [
                                            {
                                                "box": {
                                                    "id": "obj-23",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 165.5, 199.0, 117.0, 22.0 ],
                                                    "text": "transport_bypass $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-18",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 251.0, 156.0, 81.0, 22.0 ],
                                                    "text": "ceiling_dB $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-11",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 165.5, 156.0, 70.0, 22.0 ],
                                                    "text": "floor_dB $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-9",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 73.0, 156.0, 71.0, 22.0 ],
                                                    "text": "time_ms $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-7",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 237.5, 100.0, 44.0, 22.0 ],
                                                    "text": "mix $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-5",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 146.5, 100.0, 71.0, 22.0 ],
                                                    "text": "squeeze $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "id": "obj-4",
                                                    "maxclass": "message",
                                                    "numinlets": 2,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 50.0, 100.0, 86.0, 22.0 ],
                                                    "text": "style_blend $1"
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-24",
                                                    "index": 1,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 50.0, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-25",
                                                    "index": 2,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 85.0, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-26",
                                                    "index": 3,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "float" ],
                                                    "patching_rect": [ 146.5, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-27",
                                                    "index": 4,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 181.5, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-28",
                                                    "index": 5,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 216.5, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-29",
                                                    "index": 6,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "float" ],
                                                    "patching_rect": [ 251.5, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-32",
                                                    "index": 7,
                                                    "maxclass": "inlet",
                                                    "numinlets": 0,
                                                    "numoutlets": 1,
                                                    "outlettype": [ "" ],
                                                    "patching_rect": [ 286.5, 40.0, 30.0, 30.0 ]
                                                }
                                            },
                                            {
                                                "box": {
                                                    "comment": "",
                                                    "id": "obj-33",
                                                    "index": 1,
                                                    "maxclass": "outlet",
                                                    "numinlets": 1,
                                                    "numoutlets": 0,
                                                    "patching_rect": [ 149.571426, 281.0, 30.0, 30.0 ]
                                                }
                                            }
                                        ],
                                        "lines": [
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-11", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-18", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-23", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-4", 0 ],
                                                    "source": [ "obj-24", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-9", 0 ],
                                                    "source": [ "obj-25", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-5", 0 ],
                                                    "source": [ "obj-26", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-11", 0 ],
                                                    "source": [ "obj-27", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-23", 0 ],
                                                    "source": [ "obj-28", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-7", 0 ],
                                                    "source": [ "obj-29", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-18", 0 ],
                                                    "source": [ "obj-32", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-4", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-5", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-7", 0 ]
                                                }
                                            },
                                            {
                                                "patchline": {
                                                    "destination": [ "obj-33", 0 ],
                                                    "source": [ "obj-9", 0 ]
                                                }
                                            }
                                        ]
                                    },
                                    "patching_rect": [ 99.0, 239.0, 82.0, 22.0 ],
                                    "text": "p parameters"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-2",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 117.0, 79.0, 44.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 215.0, 127.0, 44.0, 18.0 ],
                                    "text": "Squeeze",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "activebgcolor": [ 0.079348079365577, 0.07934804057877, 0.079348050547289, 1.0 ],
                                    "activebgoncolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "If enabled, Squeeze will be bypassed when Transport stops. This avoids things like noise from hardware or reverb/delay tails coming up to full volume when nothing is playing.",
                                    "annotation_name": "Transport Bypass",
                                    "appearance": 1,
                                    "automation": "Off",
                                    "automationon": "On",
                                    "bgcolor": [ 0.079348079365577, 0.07934804057877, 0.079348050547289, 1.0 ],
                                    "bordercolor": [ 1.0, 0.392156862745098, 0.0, 1.0 ],
                                    "id": "obj-43",
                                    "maxclass": "live.text",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 95.0, 172.0, 99.0, 17.5 ],
                                    "pictures": [ "transport_bypass.svg", "transport_bypass.svg" ],
                                    "presentation": 1,
                                    "presentation_rect": [ 245.8046875, 133.1171875, 100.0, 15.0 ],
                                    "remapsvgcolors": 1,
                                    "saved_attribute_attributes": {
                                        "activebgcolor": {
                                            "expression": "themecolor.live_lcd_bg"
                                        },
                                        "activebgoncolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "bgcolor": {
                                            "expression": "themecolor.live_lcd_bg"
                                        },
                                        "bordercolor": {
                                            "expression": "themecolor.live_key_assignment"
                                        },
                                        "valueof": {
                                            "parameter_enum": [ "Off", "On" ],
                                            "parameter_longname": "Transport Bypass",
                                            "parameter_mmax": 1,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Transport Bypass",
                                            "parameter_type": 2
                                        }
                                    },
                                    "text": "Transport Bypass",
                                    "texton": "Transport Bypass",
                                    "usesvgviewbox": 1,
                                    "varname": "transport_bypass"
                                }
                            },
                            {
                                "box": {
                                    "activeslidercolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "Adjusts the amount of processing, similar to a ratio control on a typical compressor.",
                                    "annotation_name": "Squeeze",
                                    "appearance": 2,
                                    "id": "obj-37",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 117.0, 99.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 275.8046875, 80.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "valueof": {
                                            "parameter_initial": [ 50 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Squeeze",
                                            "parameter_mmax": 100.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Squeeze",
                                            "parameter_type": 0,
                                            "parameter_units": "%d %",
                                            "parameter_unitstyle": 9
                                        }
                                    },
                                    "varname": "live.numbox[5]"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-30",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 170.0, 122.0, 38.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 326.8046875, 95.1171875, 44.0, 18.0 ],
                                    "text": "Ceiling",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "activeslidercolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "The level that the affected audio will be normalized to.\n\nLower values combined with adjusting the 'Mix' allows you to tame the processing, making it more useful in a mixing context.\n\nThe Ceiling may be exceeded if Style is greater than 1. ",
                                    "annotation_name": "Ceiling",
                                    "appearance": 2,
                                    "id": "obj-31",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 170.0, 143.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 326.8046875, 110.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "valueof": {
                                            "parameter_exponent": 0.52,
                                            "parameter_initial": [ -3 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Ceiling",
                                            "parameter_mmax": 0.0,
                                            "parameter_mmin": -20.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Ceiling",
                                            "parameter_type": 0,
                                            "parameter_units": "dB",
                                            "parameter_unitstyle": 4
                                        }
                                    },
                                    "varname": "live.numbox[4]"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-22",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 178.0, 79.0, 23.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 326.8046875, 65.1171875, 44.0, 18.0 ],
                                    "text": "Mix",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-20",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 73.0, 122.0, 29.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 275.8046875, 95.1171875, 44.0, 18.0 ],
                                    "text": "Time",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-19",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 73.0, 79.0, 30.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 224.8046875, 65.1171875, 44.0, 18.0 ],
                                    "text": "Style",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-16",
                                    "maxclass": "live.comment",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 125.0, 122.0, 30.0, 18.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 224.8046875, 95.1171875, 44.0, 18.0 ],
                                    "text": "Floor",
                                    "textjustification": 1
                                }
                            },
                            {
                                "box": {
                                    "activeslidercolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "Adjusts the balance between the processed and unprocessed signal.",
                                    "annotation_name": "Mix",
                                    "appearance": 2,
                                    "id": "obj-12",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 167.0, 100.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 326.8046875, 80.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "valueof": {
                                            "parameter_initial": [ 50.0 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Mix",
                                            "parameter_mmax": 100.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Mix",
                                            "parameter_type": 0,
                                            "parameter_units": "%d %",
                                            "parameter_unitstyle": 9
                                        }
                                    },
                                    "varname": "live.numbox[3]"
                                }
                            },
                            {
                                "box": {
                                    "activebgcolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "activeslidercolor": [ 0.235, 0.235, 0.235, 1.0 ],
                                    "annotation": "The level at which processing will take place. Anything above this value will be pushed closer to the 'Ceiling', anything below this level will be unaffected. \n\nVery low values can bring up minute details that otherwise might never be heard, which can lead to interesting yet unpredictable results.",
                                    "annotation_name": "Floor",
                                    "appearance": 2,
                                    "id": "obj-13",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 118.0, 143.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 224.8046875, 110.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activebgcolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_control_text_bg"
                                        },
                                        "valueof": {
                                            "parameter_exponent": 0.322,
                                            "parameter_initial": [ -80 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Floor",
                                            "parameter_mmax": -20.0,
                                            "parameter_mmin": -320.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Floor",
                                            "parameter_type": 0,
                                            "parameter_units": "%d dB",
                                            "parameter_unitstyle": 9
                                        }
                                    },
                                    "varname": "live.numbox[2]"
                                }
                            },
                            {
                                "box": {
                                    "activeslidercolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "Morphs between single band and multiband operation. \n\nMultiband operation has been tuned to provide a flat frequency response with slight mid band attenuation and bass boost, similar to the original OTT. Multiband processing may exceed the Ceiling.",
                                    "annotation_name": "Style",
                                    "appearance": 2,
                                    "id": "obj-14",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 66.0, 100.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 224.8046875, 80.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "valueof": {
                                            "parameter_initial": [ 2.0 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Style",
                                            "parameter_mmax": 3.0,
                                            "parameter_mmin": 1.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Style",
                                            "parameter_type": 0,
                                            "parameter_unitstyle": 1
                                        }
                                    },
                                    "varname": "live.numbox[1]"
                                }
                            },
                            {
                                "box": {
                                    "activeslidercolor": [ 1.0, 0.349019607843137, 0.372549019607843, 1.0 ],
                                    "annotation": "Adjusts the release for all envelopes. High values will result in something closer to normalization, low values will result in extreme upward compression, squeezing every last drop from your sounds.",
                                    "annotation_name": "Time",
                                    "appearance": 2,
                                    "id": "obj-15",
                                    "maxclass": "live.numbox",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "float" ],
                                    "parameter_enable": 1,
                                    "patching_rect": [ 66.0, 143.0, 44.0, 15.0 ],
                                    "presentation": 1,
                                    "presentation_rect": [ 275.8046875, 110.1171875, 44.0, 15.0 ],
                                    "saved_attribute_attributes": {
                                        "activeslidercolor": {
                                            "expression": "themecolor.live_record"
                                        },
                                        "valueof": {
                                            "parameter_exponent": 2.11548,
                                            "parameter_initial": [ 100.0 ],
                                            "parameter_initial_enable": 1,
                                            "parameter_longname": "Time",
                                            "parameter_mmax": 400.0,
                                            "parameter_mmin": 10.0,
                                            "parameter_modmode": 0,
                                            "parameter_shortname": "Time",
                                            "parameter_type": 0,
                                            "parameter_unitstyle": 2
                                        }
                                    },
                                    "varname": "live.numbox"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-1",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "signal" ],
                                    "patching_rect": [ 99.0, 280.0, 74.0, 22.0 ],
                                    "saved_object_attributes": {
                                        "parameter_enable": 0,
                                        "parameter_mappable": 0
                                    },
                                    "text": "fs.squeeze~"
                                }
                            }
                        ],
                        "lines": [
                            {
                                "patchline": {
                                    "destination": [ "obj-48", 1 ],
                                    "source": [ "obj-1", 1 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-48", 0 ],
                                    "source": [ "obj-1", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 5 ],
                                    "source": [ "obj-12", 1 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 3 ],
                                    "source": [ "obj-13", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 0 ],
                                    "source": [ "obj-14", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 1 ],
                                    "source": [ "obj-15", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 6 ],
                                    "source": [ "obj-31", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-1", 0 ],
                                    "source": [ "obj-34", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 2 ],
                                    "source": [ "obj-37", 1 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-57", 1 ],
                                    "midpoints": [ 488.5, 273.0, 387.25, 273.0 ],
                                    "source": [ "obj-38", 1 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-57", 0 ],
                                    "midpoints": [ 353.5, 270.0, 353.5, 270.0 ],
                                    "source": [ "obj-38", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-34", 4 ],
                                    "source": [ "obj-43", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-38", 0 ],
                                    "source": [ "obj-55", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-1", 1 ],
                                    "midpoints": [ 488.5, 318.0, 183.0, 318.0, 183.0, 276.0, 163.5, 276.0 ],
                                    "source": [ "obj-57", 1 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-1", 0 ],
                                    "midpoints": [ 353.5, 309.0, 183.0, 309.0, 183.0, 276.0, 108.5, 276.0 ],
                                    "source": [ "obj-57", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-55", 0 ],
                                    "source": [ "obj-62", 0 ]
                                }
                            }
                        ]
                    },
                    "patching_rect": [ 666.0, 50.0, 104.0, 22.0 ],
                    "text": "p live_parameters",
                    "varname": "live_parameters"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-8",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 176.0, 758.5, 110.0, 24.0 ],
                    "text": "1. Enable Audio"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-3",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 155.0, 49.0, 69.0, 24.0 ],
                    "text": "2. PLAY"
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "linecount": 9,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 355.0, 208.0546875, 221.0, 127.0 ],
                    "text": "Morphs between single band and multiband operation.\n\nMultiband operation has been tuned to provide a flat frequency response with slight mid band attenuation and bass boost, similar to the original OTT. Multiband processing may exceed the Ceiling."
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "linecount": 9,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 355.0, 373.0, 221.0, 127.0 ],
                    "text": "The level at which processing will take place. Anything above this value will be pushed closer to the 'Ceiling', anything below this level will be unaffected.\n\nVery low values can bring up minute details that otherwise might never be heard, which can lead to interesting yet unpredictable results."
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 917.0, 208.0546875, 221.0, 33.0 ],
                    "text": "Adjusts the balance between the processed and unprocessed signal."
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "linecount": 10,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 917.0, 374.0546875, 222.0, 141.0 ],
                    "text": "The level that the affected audio will be normalized to.\n\nLower values combined with adjusting the 'Mix' allows you to tame the processing, making it more useful in a mixing context.\n\nThe Ceiling may be exceeded if Style is greater than 1."
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 636.0, 208.0546875, 221.0, 47.0 ],
                    "text": "Adjusts the amount of processing, similar to a ratio control on a typical compressor."
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "linecount": 6,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 636.0, 373.0, 221.0, 87.0 ],
                    "text": "Adjusts the release for all envelopes. High values will result in something closer to normalization, low values will result in extreme upward compression, squeezing every last drop from your sounds."
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "linecount": 5,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 293.0, 74.0, 221.0, 74.0 ],
                    "text": "If enabled, Squeeze will be bypassed when Transport stops. This avoids things like noise from hardware or reverb/delay tails coming up to full volume when nothing is playing."
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "linecount": 5,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 203.0, 546.0, 150.0, 74.0 ],
                    "text": "This devices does incur an 8 sample delay used for the lookahead. Keep this in mind when using with parallel signal paths."
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "linecount": 4,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 587.0, 74.0, 274.0, 60.0 ],
                    "text": "Parameters are set up exactly the same as the Max For Live device with the exception of Squeeze & Mix being 0-1 instead of 0-100 (see live_parameters patcher)"
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "lastchannelcount": 0,
                    "maxclass": "live.gain~",
                    "numinlets": 2,
                    "numoutlets": 5,
                    "outlettype": [ "signal", "signal", "", "float", "list" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 123.0, 591.0, 74.0, 133.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_longname": "live.gain~",
                            "parameter_mmax": 6.0,
                            "parameter_mmin": -70.0,
                            "parameter_modmode": 3,
                            "parameter_shortname": "live.gain~",
                            "parameter_type": 0,
                            "parameter_unitstyle": 4
                        }
                    },
                    "varname": "live.gain~"
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "ezdac~",
                    "numinlets": 2,
                    "numoutlets": 0,
                    "patching_rect": [ 123.0, 748.0, 45.0, 45.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 123.0, 49.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 9,
                    "outlettype": [ "int", "int", "float", "float", "float", "", "int", "float", "" ],
                    "patching_rect": [ 146.5, 94.0, 103.0, 22.0 ],
                    "text": "transport"
                }
            },
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "signal", "signal" ],
                    "patching_rect": [ 123.0, 546.0, 74.0, 22.0 ],
                    "saved_object_attributes": {
                        "parameter_enable": 0,
                        "parameter_mappable": 0
                    },
                    "text": "fs.squeeze~"
                }
            },
            {
                "box": {
                    "attr": "transport_bypass",
                    "id": "obj-17",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 293.0, 50.0, 221.0, 22.0 ],
                    "text_width": 173.0
                }
            },
            {
                "box": {
                    "attr": "ceiling_dB",
                    "id": "obj-18",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 917.0, 350.0546875, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "attr": "time_ms",
                    "id": "obj-19",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 636.0, 350.0, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "attr": "floor_dB",
                    "id": "obj-20",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 355.0, 350.0, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "attr": "mix",
                    "id": "obj-23",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 917.0, 184.0546875, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "attr": "squeeze",
                    "id": "obj-24",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 636.0, 184.0546875, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "attr": "style_blend",
                    "id": "obj-25",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 355.0, 184.0546875, 221.0, 22.0 ],
                    "text_width": 141.0
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "linecount": 3,
                    "maxclass": "newobj",
                    "numinlets": 4,
                    "numoutlets": 2,
                    "outlettype": [ "signal", "signal" ],
                    "patching_rect": [ 123.0, 184.0546875, 88.0, 49.0 ],
                    "text": "abl.dsp.prism~ @decay 0.5 @mix 0.1"
                }
            },
            {
                "box": {
                    "data": {
                        "clips": [
                            {
                                "absolutepath": "brushes.aif",
                                "filename": "brushes.aif",
                                "filekind": "audiofile",
                                "id": "u724003166",
                                "loop": 1,
                                "content_state": {
                                    "loop": 1
                                }
                            }
                        ]
                    },
                    "id": "obj-4",
                    "maxclass": "playlist~",
                    "mode": "basic",
                    "numinlets": 1,
                    "numoutlets": 5,
                    "outlettype": [ "signal", "signal", "signal", "", "dictionary" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 123.0, 128.0, 150.0, 30.0 ],
                    "quality": "basic",
                    "saved_attribute_attributes": {
                        "candicane2": {
                            "expression": ""
                        },
                        "candicane3": {
                            "expression": ""
                        },
                        "candicane4": {
                            "expression": ""
                        },
                        "candicane5": {
                            "expression": ""
                        },
                        "candicane6": {
                            "expression": ""
                        },
                        "candicane7": {
                            "expression": ""
                        },
                        "candicane8": {
                            "expression": ""
                        }
                    }
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-7", 1 ],
                    "source": [ "obj-1", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 1 ],
                    "midpoints": [ 201.5, 531.0, 187.5, 531.0 ],
                    "source": [ "obj-15", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-15", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 302.5, 75.0, 273.0, 75.0, 273.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 926.5, 375.0, 867.0, 375.0, 867.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-18", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 645.5, 375.0, 588.0, 375.0, 588.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-19", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 364.5, 375.0, 132.5, 375.0 ],
                    "source": [ "obj-20", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 926.5, 207.0, 867.0, 207.0, 867.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-23", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 645.5, 207.0, 588.0, 207.0, 588.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "midpoints": [ 364.5, 207.0, 222.0, 207.0, 222.0, 531.0, 132.5, 531.0 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 1 ],
                    "source": [ "obj-4", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-2", 0 ],
                    "order": 0,
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-4", 0 ],
                    "order": 1,
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 1 ],
                    "source": [ "obj-7", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-12::obj-12": [ "Mix", "Mix", 0 ],
            "obj-12::obj-13": [ "Floor", "Floor", 0 ],
            "obj-12::obj-14": [ "Style", "Style", 0 ],
            "obj-12::obj-15": [ "Time", "Time", 0 ],
            "obj-12::obj-31": [ "Ceiling", "Ceiling", 0 ],
            "obj-12::obj-37": [ "Squeeze", "Squeeze", 0 ],
            "obj-12::obj-43": [ "Transport Bypass", "Transport Bypass", 0 ],
            "obj-12::obj-62::obj-1": [ "Chord", "Chord", 0 ],
            "obj-12::obj-62::obj-26": [ "Tempo", "Tempo", 0 ],
            "obj-12::obj-62::obj-31": [ "Steps", "Steps", 0 ],
            "obj-12::obj-62::obj-46": [ "Octave", "Octave", 0 ],
            "obj-12::obj-62::obj-49": [ "Division", "Division", 0 ],
            "obj-12::obj-62::obj-5": [ "Root", "Root", 0 ],
            "obj-12::obj-62::obj-50": [ "Velocity", "Velocity", 0 ],
            "obj-12::obj-62::obj-51": [ "Length", "Length", 0 ],
            "obj-12::obj-62::obj-55": [ "Icon[2]", "live.text[1]", 0 ],
            "obj-12::obj-62::obj-56": [ "Icon", "Icon", 0 ],
            "obj-12::obj-62::obj-57": [ "Icon[1]", "Icon", 0 ],
            "obj-12::obj-62::obj-58": [ "Icon[4]", "Icon", 0 ],
            "obj-12::obj-62::obj-59": [ "Icon[5]", "Icon", 0 ],
            "obj-12::obj-62::obj-60": [ "Icon[6]", "Icon", 0 ],
            "obj-12::obj-62::obj-64": [ "Play", "Play", 0 ],
            "obj-12::obj-62::obj-7": [ "Steps[1]", "Steps", 0 ],
            "obj-12::obj-62::obj-81": [ "Icon[3]", "Icon", 0 ],
            "obj-7": [ "live.gain~", "live.gain~", 0 ],
            "parameterbanks": {
                "0": {
                    "index": 0,
                    "name": "",
                    "parameters": [ "-", "-", "-", "-", "-", "-", "-", "-" ],
                    "buttons": [ "-", "-", "-", "-", "-", "-", "-", "-" ]
                }
            },
            "inherited_shortname": 1
        },
        "autosave": 0
    }
}