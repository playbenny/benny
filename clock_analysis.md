# Clock System Analysis

This document provides an analysis of the clock system in the Benny application, focusing on the reasons why the core clock is not in total sync with Ableton Link.

## Overview

The clock system in Benny is a complex and sophisticated system that is designed to be highly flexible and configurable. It is based around the `core.clock` block, which is a polyphonic clock generator that can be synchronized to a variety of internal and external sources.

The `core.clock` block uses a discrete time Kuramoto algorithm to synchronize multiple clock sources. The Kuramoto algorithm is a mathematical model for synchronizing coupled oscillators, which is a very interesting and sophisticated approach for a clocking system.

The `global_transport_and_click.maxpat` patch is the heart of the timing system. It contains the main `transport` object, which controls the global playback. It also has a subpatcher named `p synchro_start` which is responsible for synchronizing the start of the transport with an external source.

## Ableton Link Integration

The Ableton Link integration is handled by the `link.session` object in `global_transport_and_click.maxpat`. This is the standard Max object for Ableton Link. The patch has logic to switch the clock source between `internal` and `link`. When the clock source is `link`, the tempo is received from the `link.session` object and sent to the `transport` object.

## The Synchronization Problem

The core of the problem is that the `core.clock` is not *directly* driven by the Ableton Link tempo. Instead, the Ableton Link tempo is used to set the tempo of the main `transport` object in `global_transport_and_click.maxpat`. The `core.clock` then synchronizes to this `transport` object using the Kuramoto algorithm.

This indirect synchronization can lead to timing discrepancies for a few reasons:

1.  **Kuramoto Algorithm Latency:** The Kuramoto algorithm is an iterative process that takes time to converge. This means that there will always be a small delay between a change in the `transport` tempo and the `core.clock`'s response.

2.  **`metro` Object Latency:** The `global_transport_and_click.maxpat` patch uses a `metro` object to generate bangs at regular intervals, which are then used to drive the `transport` object. The `metro` object is known to have some timing jitter, which can introduce small errors into the clock signal.

3.  **`pipe` Object Latency:** The patch uses `pipe` objects to delay signals by a certain amount of time. These objects can also introduce small timing errors.

4.  **JavaScript Event Loop:** The `clocked.js` file uses `setTimeout()` to schedule the `slowclock()` and `frameclock()` functions. The JavaScript event loop is not a real-time system, so there is no guarantee that these functions will be executed at the exact time they are scheduled.

In summary, the `core.clock` is not directly synchronized with Ableton Link. Instead, it is synchronized to the main `transport` object, which is in turn driven by the Ableton Link tempo. This indirect synchronization, combined with the inherent latencies of the Kuramoto algorithm, `metro` objects, `pipe` objects, and the JavaScript event loop, can lead to the observed sync issues.

## Startup and Initial Synchronization

The Kuramoto clock does not start immediately. It waits for the next downbeat of the external clock before starting. This is done to ensure that the `core.clock` is in sync with the external clock from the very beginning.

The `p synchro_start` subpatcher in `core.clock.maxpat` has a `metro` object that is quantized to the external clock. When the user clicks the play button, the `metro` object starts sending bangs at regular intervals. However, the `transport` object is not started until the `metro` object sends a bang that is on the downbeat of the external clock.

This waiting period can be a few milliseconds or a few seconds, depending on the tempo of the external clock and the phase of the `metro` object.

## Downbeat Definition

The downbeat is defined by the `global_transport` object in `global_transport_and_click.maxpat`, not the `core.clock`. The `core.clock` is a slave to the `global_transport` and synchronizes to it. When Ableton Link is enabled, the `link.session` object drives the `global_transport`, so the downbeat is ultimately determined by the Ableton Link session.

## Resync Logic

The `resync` function does not happen immediately because the `resync` message is quantized to the global transport. In `global_transport_and_click.maxpat`, the `resync` message is sent to a `metro` object that is quantized to the global transport. This means that the `resync` message will not be sent until the next beat of the global transport.

This quantization is necessary to ensure that all the blocks in the patch are resynchronized at the same time. If the `resync` message were sent immediately, it could cause some blocks to be resynchronized before others, which could lead to timing issues.

## Hard Resync vs. Soft Resync

Stopping and starting the transport is a reliable way to resynchronize everything completely. It's a "hard resync" that resets the entire clocking system, whereas the `resync` button is a "soft resync" that only resets the phase of the clock voices.

When the `transport` object in `global_transport_and_click.maxpat` is stopped and restarted, it resets its internal phase to the beginning of the bar. This is a hard reset that forces the transport to start from a known state.

When the transport is restarted, a new `play` message is sent, which re-triggers the `p synchro_start` subpatcher in `core.clock.maxpat`. This ensures that the `core.clock` is re-synchronized to the `transport` object from the very beginning.

When the `transport` is stopped, all the blocks in the patch receive a `stop` message. This causes them to reset their internal state and prepare for a new start. When the `transport` is restarted, all the blocks receive a `start` message, which causes them to start playing from the beginning of their sequences.

A stop/start cycle is designed to resynchronize to the downbeat, not just any beat. This ensures that all sequencers and other clocked elements start together at the beginning of a musical bar.

## Implementing a Hard Resync Button

There are a few options for implementing a hard resync button in the GUI:

**Option 1: Simple Stop/Start Button**

*   **How it works:** This is the most straightforward approach. A new button in the UI would send a `stop` message to the `transport` object, followed immediately by a `start` message.
*   **Pros:**
    *   Easy to implement.
    *   Guaranteed to perform a hard resync.
*   **Cons:**
    *   Might cause a brief, audible gap in the audio as the transport stops and restarts.

**Option 2: Quantized Hard Resync**

*   **How it works:** This option is similar to the simple stop/start button, but the `start` message is quantized to the next downbeat of the global transport. This would be similar to how the `resync` button works, but it would perform a hard reset of the transport instead of a soft reset of the clock phases.
*   **Pros:**
    *   Avoids the audible gap of the simple stop/start button.
    *   Ensures that the resync happens on a musically relevant boundary.
*   **Cons:**
    *   More complex to implement than the simple stop/start button.
    *   The resync will not be immediate, as it has to wait for the next downbeat.

**Option 3: "Panic" Button with Hard Resync**

*   **How it works:** The existing "panic" button could be modified to also perform a hard resync. When the panic button is clicked, it would send a `stop` message to the `transport`, followed by a `start` message.
*   **Pros:**
    *   Leverages an existing UI element.
    *   Provides a clear and intuitive way to perform a hard resync.
*   **Cons:**
    *   The "panic" button is currently used to reset all the blocks in the patch, so adding a hard resync to it might be confusing to users.

**Recommendation**

I would recommend **Option 2: Quantized Hard Resync**. This option provides the best balance of functionality and user experience. It avoids the audible gap of the simple stop/start button, and it ensures that the resync happens on a musically relevant boundary.

## Kuramoto Synchronization Limitations

The `core.clock`'s Kuramoto-based synchronization is purely at the tick level. It ensures that all the clock voices are in phase with each other and with the `global_transport`, but it doesn't have any knowledge of the larger musical grid. The Kuramoto model is fundamentally about synchronizing the *phases* of coupled oscillators. In the context of this clock system, the "oscillators" are the individual clock voices, and their "phase" is their position within a single clock cycle. The algorithm tries to align these phases, but it doesn't have any inherent understanding of musical time signatures or bar structures.

This is a crucial point that explains why the `resync` function doesn't always align the clock to the downbeat of the bar. It simply resets the phase of the clock to the phase of the `global_transport` at the moment the `resync` message is received.

## Potential Solutions

To improve the synchronization between the `core.clock` and Ableton Link, the following solutions could be considered:

1.  **Direct Synchronization:** The `core.clock` could be modified to be directly driven by the Ableton Link tempo. This would eliminate the need for the Kuramoto algorithm and the `transport` object, and would likely result in a much tighter synchronization.

2.  **Reduce Latency:** The latency of the Kuramoto algorithm could be reduced by increasing the `sync_strength` parameter. However, this could also lead to instability in the clock signal. The latency of the `metro` and `pipe` objects could be reduced by using more accurate timing objects, such as the `phasor~` object.

3.  **Use a Real-Time System:** The JavaScript event loop could be replaced with a real-time system, such as a Web Worker or a custom C++ extension. This would ensure that the `slowclock()` and `frameclock()` functions are executed at the exact time they are scheduled.

4.  **Drift Correction:** The `clock_time_errors` table could be used to implement a drift correction algorithm. This algorithm would analyze the timing errors of the clock and make adjustments to the tempo to keep it in sync with Ableton Link.

These are just a few potential solutions to the synchronization problem. Further research and experimentation would be needed to determine the best solution for the Benny application.