{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 9,
			"minor" : 0,
			"revision" : 5,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 100.0, 100.0, 609.0, 616.0 ],
		"openinpresentation" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"toolbars_unpinned_last_save" : 7,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-108",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 269.0, 529.0, 149.0, 22.0 ],
					"text" : "prepend special_controller"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-105",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 269.0, 497.0, 109.0, 22.0 ],
					"text" : "r special_controller"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-104",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 225.0, 69.0, 54.0, 22.0 ],
					"text" : "deferlow"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-494",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 264.0, 465.0, 151.0, 22.0 ],
					"text" : "prepend matrix_soundcard"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-495",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 264.0, 433.0, 111.0, 22.0 ],
					"text" : "r matrix_soundcard"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-493",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 264.0, 400.0, 111.0, 22.0 ],
					"text" : "prepend matrix_ext"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-492",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 264.0, 368.0, 71.0, 22.0 ],
					"text" : "r matrix_ext"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-109",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 20.5, 133.0, 24.0, 24.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-107",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "bang" ],
					"patching_rect" : [ 20.5, 161.0, 55.0, 22.0 ],
					"text" : "onebang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-106",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 88.0, -22.0, 58.0, 22.0 ],
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-103",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 20.5, 72.5, 94.0, 22.0 ],
					"text" : "prepend symbol"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-102",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 5,
					"outlettype" : [ "", "", "", "", "" ],
					"patching_rect" : [ 5.0, 39.5, 81.0, 22.0 ],
					"text" : "regexp .+/(.+)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-100",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "", "", "" ],
					"patching_rect" : [ 5.0, 7.0, 117.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"precision" : 6
					}
,
					"text" : "coll BENNYHWFILE"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-101",
					"linecount" : 27,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 606.0, 42.0, 193.0, 379.0 ],
					"text" : "in order to use the self-tuner midi to cv block we need to measure the LOOPBACK LATENCY - the time for a signal to go out and back in to the computer. this is rarely accurately reported by sound drivers so we measure it instead. once your setup is complete, from the list above choose a piece of hardware that can be set to pass audio as close to unmodified as possible - a wide open filter, or a delay set to dry only, or if you have nothing suitable, a wire from your soundcard's output to its input.\n\nthen just click the round button until the time value measured stabilises. as an example, my RME digiface/expert sleepers modules measure 590 here.\n\nfinally click save or save as at the top and this value will be stored in the json file along with your hardware setup.",
					"varname" : "latency_test_text"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-99",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 804.5, -3.0, 63.0, 22.0 ],
					"text" : "metro 100"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-98",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "int", "int", "int", "" ],
					"patching_rect" : [ 994.5, 47.0, 121.0, 22.0 ],
					"text" : "unpack 0 0 0 midiout"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-97",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "int", "" ],
					"patching_rect" : [ 984.0, 15.0, 29.5, 22.0 ],
					"text" : "t 1 l"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-96",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 984.0, -17.0, 68.0, 22.0 ],
					"text" : "r miditester"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-95",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 869.0, 30.0, 29.5, 22.0 ],
					"text" : "+ 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-94",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 2,
					"outlettype" : [ "float", "float" ],
					"patching_rect" : [ 869.0, 63.0, 101.0, 22.0 ],
					"text" : "makenote 127 50"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-92",
					"maxclass" : "newobj",
					"numinlets" : 5,
					"numoutlets" : 4,
					"outlettype" : [ "int", "", "", "int" ],
					"patching_rect" : [ 869.0, -3.0, 82.0, 22.0 ],
					"text" : "counter 0 127"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-91",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 0,
					"patching_rect" : [ 869.0, 95.0, 49.0, 22.0 ],
					"text" : "noteout"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-89",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 737.0, 196.0, 71.0, 22.0 ],
					"text" : "prepend list"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-86",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 647.5, 242.0, 71.0, 22.0 ],
					"text" : "prepend list"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1961",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 9,
							"minor" : 0,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"classnamespace" : "box",
						"rect" : [ 59.0, 107.0, 640.0, 480.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-840",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "bang", "" ],
									"patching_rect" : [ 50.0, 128.0, 37.0, 22.0 ],
									"text" : "sel 0."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-839",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "int", "int" ],
									"patching_rect" : [ 50.0, 100.0, 61.0, 22.0 ],
									"text" : "change 0."
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-98",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "dictionary" ],
									"patching_rect" : [ 50.0, 275.0, 49.0, 22.0 ],
									"text" : "dict.join"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-97",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 5,
									"outlettype" : [ "dictionary", "", "", "", "" ],
									"patching_rect" : [ 50.0, 316.0, 78.0, 22.0 ],
									"saved_object_attributes" : 									{
										"embed" : 0,
										"legacy" : 0,
										"parameter_enable" : 0,
										"parameter_mappable" : 0
									}
,
									"text" : "dict configfile"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-96",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "dictionary" ],
									"patching_rect" : [ 50.0, 205.0, 161.0, 22.0 ],
									"text" : "dict.pack measured_latency:"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-95",
									"maxclass" : "number",
									"numinlets" : 1,
									"numoutlets" : 2,
									"outlettype" : [ "", "bang" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 50.0, 164.0, 50.0, 22.0 ]
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1959",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "float" ],
									"patching_rect" : [ 50.0, 40.0, 30.0, 30.0 ]
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1960",
									"index" : 2,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "dictionary" ],
									"patching_rect" : [ 85.0, 40.0, 30.0, 30.0 ]
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-839", 0 ],
									"source" : [ "obj-1959", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-98", 1 ],
									"source" : [ "obj-1960", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-840", 0 ],
									"source" : [ "obj-839", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-95", 0 ],
									"source" : [ "obj-840", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-96", 0 ],
									"source" : [ "obj-95", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-98", 0 ],
									"source" : [ "obj-96", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-97", 0 ],
									"source" : [ "obj-98", 0 ]
								}

							}
 ],
						"originid" : "pat-4192"
					}
,
					"patching_rect" : [ 774.0, 133.0, 124.0, 22.0 ],
					"text" : "p writelatencytoconfig"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-566",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 9,
							"minor" : 0,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"classnamespace" : "box",
						"rect" : [ 59.0, 107.0, 640.0, 480.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-562",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 50.0, 100.0, 41.0, 22.0 ],
									"text" : "del 20"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-554",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 116.0, 171.5, 49.0, 22.0 ],
									"text" : "mode 0"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-97",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 94.0, 143.5, 49.0, 22.0 ],
									"text" : "mode 1"
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-563",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 77.0, 40.0, 30.0, 30.0 ]
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-565",
									"index" : 1,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 99.0, 253.5, 30.0, 30.0 ]
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-565", 0 ],
									"source" : [ "obj-554", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-97", 0 ],
									"source" : [ "obj-562", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-554", 0 ],
									"order" : 0,
									"source" : [ "obj-563", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-562", 0 ],
									"order" : 1,
									"source" : [ "obj-563", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-565", 0 ],
									"source" : [ "obj-97", 0 ]
								}

							}
 ],
						"originid" : "pat-4194"
					}
,
					"patching_rect" : [ 509.0, 53.0, 91.0, 22.0 ],
					"text" : "p trigger_timing"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-93",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 509.0, 19.0, 24.0, 24.0 ],
					"varname" : "latency_test_button"
				}

			}
, 			{
				"box" : 				{
					"fontface" : 0,
					"fontname" : "Arial",
					"fontsize" : 12.0,
					"id" : "obj-548",
					"maxclass" : "number~",
					"mode" : 2,
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "float" ],
					"patching_rect" : [ 801.0, 96.0, 56.0, 22.0 ],
					"sig" : 0.0
				}

			}
, 			{
				"box" : 				{
					"fontface" : 0,
					"fontname" : "Arial",
					"fontsize" : 12.0,
					"id" : "obj-62",
					"maxclass" : "number~",
					"mode" : 2,
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "float" ],
					"patching_rect" : [ 737.0, 96.0, 56.0, 22.0 ],
					"sig" : 0.0,
					"varname" : "latency_test_time"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-56",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 3,
					"outlettype" : [ "signal", "signal", "signal" ],
					"patching_rect" : [ 687.0, 50.0, 119.0, 22.0 ],
					"text" : "gen~ hardwaretester"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-85",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 737.5, 229.0, 45.0, 22.0 ],
					"text" : "adc~ 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-83",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 648.5, 296.0, 45.0, 22.0 ],
					"text" : "dac~ 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-82",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "int" ],
					"patching_rect" : [ 637.0, 188.0, 29.5, 22.0 ],
					"text" : "t b i"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-81",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 737.5, 156.0, 41.0, 22.0 ],
					"text" : "unjoin"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-74",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 637.0, 156.0, 41.0, 22.0 ],
					"text" : "unjoin"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1110",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 9,
							"minor" : 0,
							"revision" : 5,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"classnamespace" : "box",
						"rect" : [ 0.0, 0.0, 640.0, 480.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-85",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 149.0, 293.0, 241.0, 22.0 ],
									"saved_object_attributes" : 									{
										"legacy" : 1
									}
,
									"text" : "dict.unpack hardware_channels: @legacy 1"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-83",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 100.75, 263.0, 241.0, 22.0 ],
									"saved_object_attributes" : 									{
										"legacy" : 1
									}
,
									"text" : "dict.unpack hardware_channels: @legacy 1"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-82",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "" ],
									"patching_rect" : [ 100.75, 226.0, 109.0, 22.0 ],
									"saved_object_attributes" : 									{
										"legacy" : 0
									}
,
									"text" : "dict.unpack in: out:"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-81",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 121.0, 183.0, 140.0, 22.0 ],
									"saved_object_attributes" : 									{
										"legacy" : 0
									}
,
									"text" : "dict.unpack connections:"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-74",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 59.0, 183.0, 55.0, 22.0 ],
									"text" : "zl slice 1"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-62",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 100.0, 138.0, 22.0 ],
									"text" : "sprintf get hardware::%s"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-56",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 5,
									"outlettype" : [ "dictionary", "", "", "", "" ],
									"patching_rect" : [ 50.0, 151.0, 78.0, 22.0 ],
									"saved_object_attributes" : 									{
										"embed" : 0,
										"legacy" : 0,
										"parameter_enable" : 0,
										"parameter_mappable" : 0
									}
,
									"text" : "dict configfile"
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1107",
									"index" : 1,
									"maxclass" : "inlet",
									"numinlets" : 0,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 40.0, 30.0, 30.0 ]
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1108",
									"index" : 1,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 100.75, 375.0, 30.0, 30.0 ]
								}

							}
, 							{
								"box" : 								{
									"comment" : "",
									"id" : "obj-1109",
									"index" : 2,
									"maxclass" : "outlet",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 149.0, 375.0, 30.0, 30.0 ]
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-62", 0 ],
									"source" : [ "obj-1107", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-74", 0 ],
									"source" : [ "obj-56", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-56", 0 ],
									"source" : [ "obj-62", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-81", 0 ],
									"source" : [ "obj-74", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-82", 0 ],
									"source" : [ "obj-81", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-83", 0 ],
									"source" : [ "obj-82", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-85", 0 ],
									"source" : [ "obj-82", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-1108", 0 ],
									"source" : [ "obj-83", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-1109", 0 ],
									"source" : [ "obj-85", 0 ]
								}

							}
 ],
						"originid" : "pat-4198"
					}
,
					"patching_rect" : [ 623.0, 119.0, 116.0, 22.0 ],
					"text" : "p get_test_channels"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-90",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 689.0, 156.0, 50.0, 22.0 ],
					"text" : "1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-87",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 592.0, 156.0, 50.0, 22.0 ],
					"text" : "3 4 5"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1094",
					"items" : [ "hardware.out.1+2", ",", "hardware.filter.pro", ",", "hardware.filter.pro.2", ",", "hardware.filter.xavcf", ",", "hardware.filter.sh101", ",", "hardware.filter.xtreme", ",", "hardware.filter.delta", ",", "hardware.bbd.doepfer", ",", "hardware.bbd.sarajevo", ",", "hardware.filter.syrinx", ",", "hardware.filter.mmm.ladder", ",", "hardware.in.ext", ",", "hardware.rme.headphone.out" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 573.5, 77.0, 100.0, 22.0 ],
					"varname" : "latency_test_list"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-23",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 1,
					"outlettype" : [ "multichannelsignal" ],
					"patching_rect" : [ 371.0, 784.0, 70.0, 22.0 ],
					"text" : "mc.pack~ 3"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-21",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 371.0, 862.0, 54.0, 22.0 ],
					"text" : "mc.dac~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-18",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "multichannelsignal", "" ],
					"patching_rect" : [ 371.0, 816.0, 100.0, 22.0 ],
					"text" : "mcs.matrix~ 3 32",
					"varname" : "testmatrix"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-79",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 302.0, 759.0, 35.0, 22.0 ],
					"text" : "adc~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-76",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 302.0, 690.0, 58.0, 22.0 ],
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-63",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 127.0, 813.0, 63.0, 22.0 ],
					"text" : "cycle~ 0.2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-59",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 210.0, 798.0, 38.0, 22.0 ],
					"text" : "pink~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-54",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "signal" ],
					"patching_rect" : [ 28.0, 862.0, 37.0, 22.0 ],
					"text" : "saw~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-53",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 28.0, 830.0, 45.0, 22.0 ],
					"text" : "mtof 0."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-50",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 28.0, 801.0, 29.5, 22.0 ],
					"text" : "+"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-32",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 88.0, 769.0, 30.0, 22.0 ],
					"text" : "* 12"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-30",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 183.0, 711.0, 89.0, 22.0 ],
					"text" : "1 3 5 6 8 10 12"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-22",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 28.0, 769.0, 56.0, 22.0 ],
					"text" : "zl lookup"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-16",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 737.0, 59.0, 22.0 ],
					"text" : "random 8"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-14",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 28.0, 737.0, 59.0, 22.0 ],
					"text" : "random 8"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-10",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "bang" ],
					"patching_rect" : [ 28.0, 705.0, 32.0, 22.0 ],
					"text" : "t b b"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 28.0, 673.0, 119.0, 22.0 ],
					"text" : "metro 250 @active 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "deleteall" ],
					"patching_rect" : [ 141.5, 13.0, 70.0, 22.0 ],
					"text" : "t b deleteall"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 5.0, -26.0, 70.0, 22.0 ],
					"text" : "loadmess 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1253",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 984.0, 85.0, 78.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict configfile"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-926",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 571.0, 319.0, 58.0, 22.0 ],
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-88",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 481.600000000000023, 134.0, 53.0, 22.0 ],
					"text" : "deleteall"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-84",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 571.0, 351.0, 73.0, 22.0 ],
					"text" : "autowatch 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-78",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 481.0, 762.5, 192.0, 22.0 ],
					"text" : "append add hardware from library:"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-77",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 638.0, 816.0, 158.0, 22.0 ],
					"text" : "add controller from library:"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-75",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 460.0, 733.5, 191.0, 22.0 ],
					"text" : "append add controller from library:"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-73",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "bang", "bang", "bang", "clear" ],
					"patching_rect" : [ 442.0, 701.5, 71.0, 22.0 ],
					"text" : "t b b b clear"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-67",
					"items" : [ "add", "controller", "from", "library:" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 685.0, 744.5, 100.0, 22.0 ],
					"varname" : "controller_library"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-68",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 685.0, 701.5, 96.0, 22.0 ],
					"text" : "prepend append"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-69",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 685.0, 672.5, 25.0, 22.0 ],
					"text" : "iter"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-70",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 664.0, 646.5, 61.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-71",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 664.0, 614.5, 50.0, 22.0 ],
					"text" : "getkeys"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-72",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "" ],
					"patching_rect" : [ 664.0, 582.5, 29.5, 22.0 ],
					"text" : "t b l"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-66",
					"items" : [ "add", "hardware", "from", "library:" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 787.5, 744.5, 100.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1222.0, 440.0, 22.0 ],
					"varname" : "hardware_library"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-65",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 787.5, 702.0, 96.0, 22.0 ],
					"text" : "prepend append"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-64",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 787.5, 673.25, 25.0, 22.0 ],
					"text" : "iter"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-61",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 766.5, 646.5, 61.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-60",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 766.5, 614.5, 50.0, 22.0 ],
					"text" : "getkeys"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-58",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "" ],
					"patching_rect" : [ 766.5, 582.5, 29.5, 22.0 ],
					"text" : "t b l"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-55",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 702.0, 546.0, 164.0, 22.0 ],
					"text" : "route io::controllers hardware"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-51",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 687.0, 486.0, 177.0, 22.0 ],
					"text" : "get io::controllers, get hardware"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-48",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 687.0, 518.0, 130.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict libraryfile @quiet 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-41",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "" ],
					"patching_rect" : [ 529.600000000000023, 587.0, 34.0, 22.0 ],
					"text" : "sel 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-39",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "int" ],
					"patching_rect" : [ 481.600000000000023, 555.0, 67.0, 22.0 ],
					"text" : "unpack s 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-35",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 481.600000000000023, 523.0, 92.0, 22.0 ],
					"text" : "route read write"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-11",
					"maxclass" : "dict.view",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 885.0, 194.0, 215.0, 411.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 421.600000000000023, 491.0, 79.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict libraryfile"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-57",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 466.0, 328.0, 58.0, 22.0 ],
					"text" : "loadbang"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-49",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 332.600000000000023, 133.0, 63.0, 22.0 ],
					"text" : "writeagain"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-47",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"patching_rect" : [ 322.0, 229.0, 22.0, 22.0 ],
					"text" : "t 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-46",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "" ],
					"patching_rect" : [ 322.0, 197.0, 34.0, 22.0 ],
					"text" : "sel 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-45",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "int" ],
					"patching_rect" : [ 274.0, 165.0, 67.0, 22.0 ],
					"text" : "unpack s 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-44",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 397.100000000000023, 133.0, 81.0, 22.0 ],
					"text" : "prepend write"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-43",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "bang" ],
					"patching_rect" : [ 356.199999999999989, 101.0, 91.0, 22.0 ],
					"text" : "savedialog json"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-42",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 370.200000000000045, 37.0, 53.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 407.0, 11.0, 53.0, 22.0 ],
					"text" : "save_as"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-40",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 249.0, 229.0, 77.0, 22.0 ],
					"text" : "configloaded"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-38",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "" ],
					"patching_rect" : [ 249.0, 197.0, 34.0, 22.0 ],
					"text" : "sel 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-37",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "int" ],
					"patching_rect" : [ 201.0, 165.0, 67.0, 22.0 ],
					"text" : "unpack s 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-36",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 201.0, 131.0, 92.0, 22.0 ],
					"text" : "route read write"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-34",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 250.0, 101.0, 52.0, 22.0 ],
					"text" : "gate 2 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-33",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 328.0, 37.0, 34.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 367.0, 11.0, 34.0, 22.0 ],
					"text" : "save"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-31",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 283.0, 37.0, 35.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 326.0, 11.0, 35.0, 22.0 ],
					"text" : "open"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-29",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "int", "bang" ],
					"patching_rect" : [ 319.600000000000023, 101.0, 32.0, 22.0 ],
					"text" : "t 1 b"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-28",
					"maxclass" : "newobj",
					"numinlets" : 6,
					"numoutlets" : 6,
					"outlettype" : [ "bang", "bang", "bang", "bang", "bang", "" ],
					"patching_rect" : [ 283.0, 69.0, 202.0, 22.0 ],
					"text" : "sel open save save_as sure? cancel"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-27",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 141.5, 46.0, 38.0, 22.0 ],
					"text" : "zl reg"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-26",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 374.100000000000023, 455.0, 114.0, 22.0 ],
					"text" : "route getmidi library"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-25",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 397.100000000000023, 388.0, 101.0, 22.0 ],
					"text" : "prepend midiouts"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-24",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 374.100000000000023, 356.0, 42.0, 22.0 ],
					"text" : "gate 2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-20",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 374.100000000000023, 388.0, 93.0, 22.0 ],
					"text" : "prepend midiins"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-19",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "int" ],
					"patching_rect" : [ 383.100000000000023, 262.0, 32.0, 22.0 ],
					"text" : "t b 1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-17",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 352.100000000000023, 228.0, 24.0, 24.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-15",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "int" ],
					"patching_rect" : [ 352.100000000000023, 262.0, 32.0, 22.0 ],
					"text" : "t b 2"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-13",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "" ],
					"patching_rect" : [ 352.100000000000023, 328.0, 109.0, 22.0 ],
					"text" : "route clear append"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-12",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 352.100000000000023, 296.0, 50.0, 22.0 ],
					"text" : "midiinfo"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-9",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 112.0, 71.5, 24.0, 24.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-7",
					"maxclass" : "dict.view",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 27.0, 208.0, 215.0, 411.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 141.5, 72.5, 80.0, 22.0 ],
					"text" : "prepend read"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 5,
					"outlettype" : [ "dictionary", "", "", "", "" ],
					"patching_rect" : [ 141.5, 100.0, 78.0, 22.0 ],
					"saved_object_attributes" : 					{
						"embed" : 0,
						"legacy" : 0,
						"parameter_enable" : 0,
						"parameter_mappable" : 0
					}
,
					"text" : "dict configfile"
				}

			}
, 			{
				"box" : 				{
					"autopopulate" : 1,
					"bgcolor" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
					"bgfillcolor_color1" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
					"bgfillcolor_color2" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "color",
					"fontname" : "Consolas Bold",
					"fontsize" : 12.0,
					"id" : "obj-52",
					"items" : [ "jh alyseum matrix case.json", ",", "luke studio.json", ",", "midi_drum_machine_example.json", ",", "no_hardware.json", ",", "wedge case click.json", ",", "wedge case cue no click.json" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 20.5, 106.0, 330.0, 23.0 ],
					"prefix" : "~/Documents/GitHub/benny/hardware_configs/",
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 10.5, 310.0, 23.0 ],
					"types" : ".json",
					"varname" : "hw_list"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 374.100000000000023, 423.0, 157.0, 22.0 ],
					"saved_object_attributes" : 					{
						"filename" : "hardware_config_editor.js",
						"parameter_enable" : 0
					}
,
					"text" : "js hardware_config_editor.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-80",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 302.0, 729.0, 32.0, 22.0 ],
					"text" : "start"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"id" : "obj-197",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 50.0, 384.0, 20.0 ],
					"text" : "keyboards",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-199",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 50.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.keyboards"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"id" : "obj-201",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 80.0, 384.0, 20.0 ],
					"text" : "controllers (5)",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-203",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 80.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.controllers"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"id" : "obj-205",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 110.0, 384.0, 20.0 ],
					"text" : "hardware (13)",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-207",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 110.0, 66.0, 20.0 ],
					"text" : "hide",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.none"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-209",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 140.0, 374.0, 20.0 ],
					"text" : "hardware.out.1+2",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-211",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 140.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.0"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-213",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 160.0, 374.0, 20.0 ],
					"text" : "hardware.filter.pro",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-215",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 160.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.1"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-217",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 180.0, 374.0, 20.0 ],
					"text" : "hardware.filter.pro.2",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-219",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 180.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.2"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-221",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 200.0, 374.0, 20.0 ],
					"text" : "hardware.filter.xavcf",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-223",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 200.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.3"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-225",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 220.0, 374.0, 20.0 ],
					"text" : "hardware.filter.sh101",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-227",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 220.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.4"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"border" : 0.0,
					"id" : "obj-229",
					"keymode" : 1,
					"linecount" : 2,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 240.0, 374.0, 20.0 ],
					"rounded" : 0.0,
					"text" : "hardware.filter.xtreme",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
					"varname" : "hardwarename.16"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-231",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 240.0, 66.0, 20.0 ],
					"text" : "hide",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.-1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-233",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 270.0, 220.0, 20.0 ],
					"text" : "remove block",
					"textoncolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"varname" : "remove.hardware.block.18"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-235",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 30.0, 300.0, 150.0, 20.0 ],
					"text" : "help text"
				}

			}
, 			{
				"box" : 				{
					"border" : 0.0,
					"id" : "obj-237",
					"keymode" : 1,
					"linecount" : 2,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 300.0, 220.0, 60.0 ],
					"rounded" : 0.0,
					"text" : "doepfer xtreme(!) filter",
					"varname" : "hardware.help_text.20"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-239",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 30.0, 360.0, 150.0, 20.0 ],
					"text" : "exclusive"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-241",
					"maxclass" : "toggle",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 24.0, 24.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 360.0, 20.0, 20.0 ],
					"varname" : "hardware.exclusive.22"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-243",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 30.0, 380.0, 150.0, 20.0 ],
					"text" : "max polyphony"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-245",
					"maxclass" : "number",
					"maximum" : 128,
					"minimum" : 0,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 50.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 380.0, 220.0, 22.0 ],
					"varname" : "hardware.max_polyphony.24"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-247",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 30.0, 400.0, 150.0, 20.0 ],
					"text" : "substitute"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-249",
					"items" : [ "none", ",", "core.clock", ",", "core.input.control.auto", ",", "core.input.control.basic", ",", "core.input.keyboard", ",", "core.scales.shapes", ",", "core.space", ",", "core.states", ",", "core.tuning", ",", "jh.clock.out", ",", "jh.pepper.looper", ",", "midi.autodamp", ",", "midi.calculus", ",", "midi.curve.map.1d", ",", "midi.delay", ",", "midi.ducker", ",", "midi.fidget", ",", "midi.fold", ",", "midi.free.clock", ",", "midi.holes", ",", "midi.lfo", ",", "midi.note.length", ",", "midi.note.select", ",", "midi.pitch.range", ",", "midi.rhythmes.alpes", ",", "midi.scale.quantise", ",", "midi.smooth", ",", "midi.stats", ",", "midi.sustain", ",", "midi.switch", ",", "midi.utility.buttons", ",", "midi.utility.delay", ",", "midi.utility.values", ",", "midi.velocity", ",", "midi.wait", ",", "seq.eight.step.rhythm", ",", "seq.grid-o", ",", "seq.grid", ",", "seq.jumps", ",", "seq.note.step", ",", "seq.note.tracker", ",", "seq.note.tracker.old", ",", "seq.note.trackerL", ",", "seq.piano.roll", ",", "seq.rene", ",", "seq.shape.player", ",", "seq.values", ",", "seq.wonky", ",", "fx.abl.distortion", ",", "fx.abl.fuzz", ",", "fx.abl.pitchshift", ",", "fx.abl.waveshaper", ",", "fx.clouds", ",", "fx.clouds.pvoc", ",", "fx.delay.buckets", ",", "fx.delay.stretch", ",", "fx.delay.tape", ",", "fx.elements.verb", ",", "fx.filter.2pole.env", ",", "fx.filter.2pole", ",", "fx.filter.abl.filther", ",", "fx.filter.abl.lowpass", ",", "fx.filter.abl.vowel", ",", "fx.filter.fixed.bank", ",", "fx.filter.reson", ",", "fx.filter.vactrol.lpg", ",", "fx.freeze", ",", "fx.freqshift", ",", "fx.mod.abl.chorus", ",", "fx.mod.abl.ensemble", ",", "fx.mod.abl.flanger", ",", "fx.mod.abl.phaser", ",", "fx.mod.abl.vibrato", ",", "fx.pitch.divider", ",", "fx.pitch.gate", ",", "fx.pitch.retune", ",", "fx.pitch.shift", ",", "fx.reverb.abl.darkhall", ",", "fx.reverb.abl.plate", ",", "fx.reverb.abl.prism", ",", "fx.reverb.abl.quartz", ",", "fx.reverb.abl.shimmer", ",", "fx.reverb.abl.tides", ",", "fx.varispeed.looper", ",", "fx.warps", ",", "fx.wavefold", ",", "fx.wizard.saturation", ",", "mix.bus", ",", "mix.channel", ",", "mix.stereo.channel", ",", "seq.analogue", ",", "seq.curved.time", ",", "seq.sample.tracker", ",", "seq.sample.tracker.old", ",", "source.abl.chip", ",", "source.abl.crackle", ",", "source.basic.osc", ",", "source.braids", ",", "source.dual.osc", ",", "source.harmonic.osc", ",", "source.quanti.slide.osc", ",", "source.random.noise.s&h", ",", "source.sheep", ",", "source.shepherd.osc", ",", "source.stick.slip", ",", "source.tides", ",", "source.wave.scan", ",", "utility.abl.3band.eq", ",", "utility.abl.compressor", ",", "utility.abl.env.follow", ",", "utility.abl.limiter", ",", "utility.abl.transient.design", ",", "utility.audio.smooth", ",", "utility.basic.file.player", ",", "utility.bonk", ",", "utility.cv.scale.quantise", ",", "utility.delay", ",", "utility.env.asr", ",", "utility.env.eight.stage", ",", "utility.env.four.stage", ",", "utility.eq.peak", ",", "utility.gate", ",", "utility.lowpass.highpass", ",", "utility.mid.side", ",", "utility.pan.mono", ",", "utility.record.endpoint.stereo", ",", "utility.self.tuner", ",", "utility.sidechain.compressor", ",", "utility.vca.env", ",", "utility.vca", ",", "utility.xfade", ",", "voice.basic", ",", "voice.dual", ",", "voice.elements", ",", "voice.harmonic", ",", "voice.ks", ",", "voice.modal", ",", "voice.multi.sample.player", ",", "voice.noise", ",", "voice.organ", ",", "voice.pitch.env", ",", "voice.plaits", ",", "voice.rings", ",", "voice.sample.player", ",", "voice.shepherd", ",", "vst.DC1A2", ",", "vst.DeRez2", ",", "vst.Elation", ",", "vst.Fab.Filter.Pro.C.2", ",", "vst.Focus", ",", "vst.Mojo", ",", "vst.Pressure4", ",", "vst.ToTape6", ",", "vst.Valhalla.Delay", ",", "vst.Valhalla.FreqEcho", ",", "vst.Valhalla.Plate", ",", "vst.Valhalla.Room", ",", "vst.Valhalla.Space.Modulator", ",", "vst.Valhalla.Supermassive", ",", "vst.Valhalla.UberMod", ",", "vst.Valhalla.Vintage.Verb", ",", "hardware.out.1+2", ",", "hardware.filter.pro", ",", "hardware.filter.pro.2", ",", "hardware.filter.xavcf", ",", "hardware.filter.sh101", ",", "hardware.filter.xtreme", ",", "hardware.filter.delta", ",", "hardware.bbd.doepfer", ",", "hardware.bbd.sarajevo", ",", "hardware.filter.syrinx", ",", "hardware.filter.mmm.ladder", ",", "hardware.in.ext", ",", "hardware.rme.headphone.out" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 400.0, 220.0, 22.0 ],
					"varname" : "hardware.substitute.26"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-251",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 30.0, 430.0, 430.0, 20.0 ],
					"text" : "connections",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.594, 0.449, 0.0, 1.0 ],
					"id" : "obj-253",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 34.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 460.0, 420.0, 20.0 ],
					"text" : "in (to hardware, from benny)",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-255",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 490.0, 150.0, 20.0 ],
					"text" : "input name"
				}

			}
, 			{
				"box" : 				{
					"border" : 0.0,
					"id" : "obj-257",
					"keymode" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 490.0, 220.0, 22.0 ],
					"rounded" : 0.0,
					"text" : "in LP",
					"varname" : "hardware.in.name.30"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-259",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 510.0, 150.0, 20.0 ],
					"text" : "audio channel"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-261",
					"maxclass" : "number",
					"maximum" : 256,
					"minimum" : 1,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 50.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 510.0, 60.0, 22.0 ],
					"varname" : "hardware.in.channel.32"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-263",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 530.0, 150.0, 20.0 ],
					"text" : "send test signal"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-265",
					"items" : [ "none", ",", "tones", ",", "pink noise", ",", "lfo" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 530.0, 220.0, 22.0 ],
					"varname" : "hardwaretestsignal.34"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-267",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 560.0, 220.0, 20.0 ],
					"text" : "remove channel",
					"textoncolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"varname" : "remove.hardware.in.channel.35"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-269",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 590.0, 150.0, 20.0 ],
					"text" : "input name"
				}

			}
, 			{
				"box" : 				{
					"border" : 0.0,
					"id" : "obj-271",
					"keymode" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 590.0, 220.0, 22.0 ],
					"rounded" : 0.0,
					"text" : "in HP",
					"varname" : "hardware.in.name.37"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-273",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 610.0, 150.0, 20.0 ],
					"text" : "audio channel"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-275",
					"maxclass" : "number",
					"maximum" : 256,
					"minimum" : 1,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 50.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 610.0, 60.0, 22.0 ],
					"varname" : "hardware.in.channel.39"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-277",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 630.0, 150.0, 20.0 ],
					"text" : "send test signal"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-279",
					"items" : [ "none", ",", "tones", ",", "pink noise", ",", "lfo" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 630.0, 220.0, 22.0 ],
					"varname" : "hardwaretestsignal.41"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-281",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 660.0, 220.0, 20.0 ],
					"text" : "remove channel",
					"textoncolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"varname" : "remove.hardware.in.channel.42"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-283",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 690.0, 150.0, 20.0 ],
					"text" : "input name"
				}

			}
, 			{
				"box" : 				{
					"border" : 0.0,
					"id" : "obj-285",
					"keymode" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 690.0, 220.0, 22.0 ],
					"rounded" : 0.0,
					"text" : "cutoff",
					"varname" : "hardware.in.name.44"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-287",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 710.0, 150.0, 20.0 ],
					"text" : "audio channel"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-289",
					"maxclass" : "number",
					"maximum" : 256,
					"minimum" : 1,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 50.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 710.0, 60.0, 22.0 ],
					"varname" : "hardware.in.channel.46"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-291",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 730.0, 150.0, 20.0 ],
					"text" : "send test signal"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-293",
					"items" : [ "none", ",", "tones", ",", "pink noise", ",", "lfo" ],
					"maxclass" : "umenu",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 730.0, 220.0, 22.0 ],
					"varname" : "hardwaretestsignal.48"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-295",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 760.0, 220.0, 20.0 ],
					"text" : "remove channel",
					"textoncolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"varname" : "remove.hardware.in.channel.49"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-297",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 790.0, 220.0, 20.0 ],
					"text" : "add a hardware input channel",
					"textoncolor" : [ 0.0, 1.0, 0.0, 1.0 ],
					"varname" : "add.hardware.in.channel.50"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-299",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 820.0, 220.0, 20.0 ],
					"text" : "add a midi input channel",
					"textoncolor" : [ 0.0, 1.0, 0.0, 1.0 ],
					"varname" : "add.hardware.midi.in.channel.51"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.594, 0.449, 0.0, 1.0 ],
					"id" : "obj-301",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 34.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 850.0, 420.0, 20.0 ],
					"text" : "out (from hardware, to benny)",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-303",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 880.0, 150.0, 20.0 ],
					"text" : "output name"
				}

			}
, 			{
				"box" : 				{
					"border" : 0.0,
					"id" : "obj-305",
					"keymode" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 50.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 880.0, 220.0, 22.0 ],
					"rounded" : 0.0,
					"text" : "out",
					"varname" : "hardware.out.name.54"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-307",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 40.0, 900.0, 150.0, 20.0 ],
					"text" : "audio channel"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-309",
					"maxclass" : "number",
					"maximum" : 256,
					"minimum" : 1,
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 50.0, 22.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 900.0, 60.0, 22.0 ],
					"varname" : "hardware.out.channel.56"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-311",
					"maxclass" : "meter~",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "float" ],
					"patching_rect" : [ 10.0, 100.0, 80.0, 13.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 920.0, 220.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-312",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 10.0, 100.0, 100.0, 22.0 ],
					"text" : "adc~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-314",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 952.0, 220.0, 20.0 ],
					"text" : "remove channel",
					"textoncolor" : [ 1.0, 0.2, 0.2, 1.0 ],
					"varname" : "remove.hardware.out.channel.59"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-316",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 982.0, 220.0, 20.0 ],
					"text" : "add a hardware output channel",
					"textoncolor" : [ 0.0, 1.0, 0.0, 1.0 ],
					"varname" : "add.hardware.out.channel.60"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-318",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 240.0, 1012.0, 220.0, 20.0 ],
					"text" : "add a midi output channel",
					"textoncolor" : [ 0.0, 1.0, 0.0, 1.0 ],
					"varname" : "add.hardware.midi.out.channel.61"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-320",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1042.0, 374.0, 20.0 ],
					"text" : "hardware.filter.delta",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-322",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1042.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.6"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-324",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1062.0, 374.0, 20.0 ],
					"text" : "hardware.bbd.doepfer",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-326",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1062.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.7"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-328",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1082.0, 374.0, 20.0 ],
					"text" : "hardware.bbd.sarajevo",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-330",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1082.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.8"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-332",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1102.0, 374.0, 20.0 ],
					"text" : "hardware.filter.syrinx",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-334",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1102.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.9"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-336",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 34.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1122.0, 374.0, 20.0 ],
					"text" : "hardware.filter.mmm.ladder",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-338",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1122.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.10"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-340",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1142.0, 374.0, 20.0 ],
					"text" : "hardware.in.ext",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-342",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1142.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.11"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.694, 0.549, 0.0, 1.0 ],
					"id" : "obj-344",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 34.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1162.0, 374.0, 20.0 ],
					"text" : "hardware.rme.headphone.out",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-346",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1162.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.hardware.12"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-348",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 1192.0, 440.0, 20.0 ],
					"text" : "add another hardware block",
					"textoncolor" : [ 0.0, 1.0, 0.0, 1.0 ],
					"varname" : "add.hardware.newblock.76"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"id" : "obj-350",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 10.0, 100.0, 150.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 1252.0, 384.0, 20.0 ],
					"text" : "advanced settings",
					"textcolor" : [ 0.0, 0.0, 0.0, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-352",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 100.0, 100.0, 20.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 394.0, 1252.0, 66.0, 20.0 ],
					"text" : "show",
					"textoncolor" : [ 1.0, 0.792, 0.0, 1.0 ],
					"varname" : "show.advanced"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-100", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-14", 0 ],
					"source" : [ "obj-10", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-16", 0 ],
					"source" : [ "obj-10", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-102", 0 ],
					"source" : [ "obj-100", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-103", 0 ],
					"source" : [ "obj-102", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-52", 0 ],
					"source" : [ "obj-103", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-34", 0 ],
					"source" : [ "obj-104", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-108", 0 ],
					"source" : [ "obj-105", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-107", 1 ],
					"source" : [ "obj-106", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-31", 0 ],
					"source" : [ "obj-107", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-108", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-107", 0 ],
					"source" : [ "obj-109", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1110", 0 ],
					"source" : [ "obj-1094", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-74", 0 ],
					"order" : 0,
					"source" : [ "obj-1110", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-81", 0 ],
					"order" : 0,
					"source" : [ "obj-1110", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-87", 1 ],
					"order" : 1,
					"source" : [ "obj-1110", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-90", 1 ],
					"order" : 1,
					"source" : [ "obj-1110", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-13", 0 ],
					"source" : [ "obj-12", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 1 ],
					"source" : [ "obj-13", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-22", 0 ],
					"source" : [ "obj-14", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-12", 0 ],
					"source" : [ "obj-15", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 0 ],
					"source" : [ "obj-15", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-32", 0 ],
					"source" : [ "obj-16", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-15", 0 ],
					"order" : 1,
					"source" : [ "obj-17", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-19", 0 ],
					"order" : 0,
					"source" : [ "obj-17", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-21", 0 ],
					"source" : [ "obj-18", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-12", 1 ],
					"source" : [ "obj-19", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 0 ],
					"source" : [ "obj-19", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-27", 0 ],
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-2", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-20", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-50", 0 ],
					"source" : [ "obj-22", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-18", 0 ],
					"source" : [ "obj-23", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-20", 0 ],
					"source" : [ "obj-24", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-25", 0 ],
					"source" : [ "obj-24", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-25", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-17", 0 ],
					"source" : [ "obj-26", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 0 ],
					"source" : [ "obj-26", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-103", 0 ],
					"order" : 1,
					"source" : [ "obj-27", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-6", 0 ],
					"order" : 0,
					"source" : [ "obj-27", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-29", 0 ],
					"source" : [ "obj-28", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-34", 1 ],
					"source" : [ "obj-28", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-43", 0 ],
					"source" : [ "obj-28", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-34", 0 ],
					"source" : [ "obj-29", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-49", 0 ],
					"order" : 1,
					"source" : [ "obj-29", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-88", 0 ],
					"order" : 0,
					"source" : [ "obj-29", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-35", 0 ],
					"source" : [ "obj-3", 4 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-22", 1 ],
					"source" : [ "obj-30", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-31", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-311", 0 ],
					"source" : [ "obj-312", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-50", 1 ],
					"source" : [ "obj-32", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-33", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-34", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-39", 0 ],
					"source" : [ "obj-35", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-37", 0 ],
					"source" : [ "obj-36", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-45", 0 ],
					"source" : [ "obj-36", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-38", 0 ],
					"source" : [ "obj-37", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-40", 0 ],
					"source" : [ "obj-38", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-41", 0 ],
					"source" : [ "obj-39", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-26", 0 ],
					"source" : [ "obj-4", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-40", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-73", 0 ],
					"source" : [ "obj-41", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-42", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-44", 0 ],
					"order" : 1,
					"source" : [ "obj-43", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-88", 0 ],
					"order" : 0,
					"source" : [ "obj-43", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-44", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-46", 0 ],
					"source" : [ "obj-45", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-47", 0 ],
					"order" : 1,
					"source" : [ "obj-46", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-57", 0 ],
					"order" : 0,
					"source" : [ "obj-46", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-104", 0 ],
					"source" : [ "obj-47", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-55", 0 ],
					"source" : [ "obj-48", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-49", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-493", 0 ],
					"source" : [ "obj-492", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-493", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-494", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-494", 0 ],
					"source" : [ "obj-495", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1961", 1 ],
					"order" : 0,
					"source" : [ "obj-5", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-36", 0 ],
					"order" : 0,
					"source" : [ "obj-5", 4 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 0 ],
					"order" : 1,
					"source" : [ "obj-5", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-9", 0 ],
					"order" : 1,
					"source" : [ "obj-5", 4 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-53", 0 ],
					"source" : [ "obj-50", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-48", 0 ],
					"source" : [ "obj-51", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-109", 0 ],
					"source" : [ "obj-52", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-27", 1 ],
					"source" : [ "obj-52", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-54", 0 ],
					"source" : [ "obj-53", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-23", 0 ],
					"source" : [ "obj-54", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-58", 0 ],
					"source" : [ "obj-55", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-72", 0 ],
					"source" : [ "obj-55", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-548", 0 ],
					"source" : [ "obj-56", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-62", 0 ],
					"source" : [ "obj-56", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-83", 0 ],
					"source" : [ "obj-56", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-56", 0 ],
					"source" : [ "obj-566", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-57", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-60", 0 ],
					"source" : [ "obj-58", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-61", 1 ],
					"source" : [ "obj-58", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-23", 1 ],
					"source" : [ "obj-59", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-6", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-61", 0 ],
					"source" : [ "obj-60", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-64", 0 ],
					"source" : [ "obj-61", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1961", 0 ],
					"source" : [ "obj-62", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-23", 2 ],
					"source" : [ "obj-63", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-65", 0 ],
					"source" : [ "obj-64", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-66", 0 ],
					"source" : [ "obj-65", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-77", 1 ],
					"source" : [ "obj-67", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-67", 0 ],
					"source" : [ "obj-68", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-68", 0 ],
					"source" : [ "obj-69", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-69", 0 ],
					"source" : [ "obj-70", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-70", 0 ],
					"source" : [ "obj-71", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-70", 1 ],
					"source" : [ "obj-72", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-71", 0 ],
					"source" : [ "obj-72", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-51", 0 ],
					"source" : [ "obj-73", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-66", 0 ],
					"order" : 0,
					"source" : [ "obj-73", 3 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-67", 0 ],
					"order" : 1,
					"source" : [ "obj-73", 3 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-75", 0 ],
					"source" : [ "obj-73", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-78", 0 ],
					"source" : [ "obj-73", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-82", 0 ],
					"source" : [ "obj-74", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-67", 0 ],
					"source" : [ "obj-75", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-30", 0 ],
					"order" : 1,
					"source" : [ "obj-76", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-80", 0 ],
					"order" : 0,
					"source" : [ "obj-76", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-66", 0 ],
					"source" : [ "obj-78", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"source" : [ "obj-8", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-79", 0 ],
					"source" : [ "obj-80", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-89", 0 ],
					"source" : [ "obj-81", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-86", 0 ],
					"source" : [ "obj-82", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-93", 0 ],
					"source" : [ "obj-82", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-84", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-56", 0 ],
					"source" : [ "obj-85", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-83", 0 ],
					"source" : [ "obj-86", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-88", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-85", 0 ],
					"source" : [ "obj-89", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-9", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-95", 0 ],
					"source" : [ "obj-92", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-84", 0 ],
					"source" : [ "obj-926", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-566", 0 ],
					"source" : [ "obj-93", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-91", 1 ],
					"source" : [ "obj-94", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-91", 0 ],
					"source" : [ "obj-94", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-94", 0 ],
					"source" : [ "obj-95", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-97", 0 ],
					"source" : [ "obj-96", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-98", 0 ],
					"source" : [ "obj-97", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-99", 0 ],
					"source" : [ "obj-97", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-91", 0 ],
					"source" : [ "obj-98", 3 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-91", 2 ],
					"source" : [ "obj-98", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-92", 4 ],
					"source" : [ "obj-98", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-95", 1 ],
					"source" : [ "obj-98", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-92", 0 ],
					"source" : [ "obj-99", 0 ]
				}

			}
 ],
		"originid" : "pat-4190",
		"dependency_cache" : [ 			{
				"name" : "hardware_config_editor.js",
				"bootpath" : "~/Documents/GitHub/benny/code",
				"patcherrelativepath" : "../code",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "hardwaretester.gendsp",
				"bootpath" : "~/Documents/GitHub/benny/code",
				"patcherrelativepath" : "../code",
				"type" : "gDSP",
				"implicit" : 1
			}
 ],
		"autosave" : 0,
		"color" : [ 1.0, 0.792156862745098, 0.0, 1.0 ],
		"textcolor" : [ 1.0, 0.792156862745098, 0.0, 1.0 ],
		"textcolor_inverse" : [ 1.0, 0.792156862745098, 0.0, 1.0 ],
		"bgcolor" : [ 0.0, 0.0, 0.0, 1.0 ],
		"bgfillcolor_type" : "color",
		"bgfillcolor_color1" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
		"bgfillcolor_color2" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ],
		"bgfillcolor_color" : [ 0.185926180762898, 0.185926127990462, 0.185926141780742, 1.0 ]
	}

}
