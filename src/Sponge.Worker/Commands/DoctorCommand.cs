﻿using CliFx.Attributes;
using CliFx.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sponge.Worker.Commands
{
    [Command("doctor", Description = "Checks the condition of the Sponge system.")]
    public class DoctorCommand : ICommand
    {
        public ValueTask ExecuteAsync(IConsole console)
        {
            return default;
        }
    }
}
