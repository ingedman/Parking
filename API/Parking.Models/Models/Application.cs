﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Sieena.Parking.API.Models
{
    /// <summary>
    /// Applications that can access the Api
    /// </summary>
    public partial class Application
    {
        /// <summary>
        /// Get all the registered applications.
        /// </summary>
        /// <returns></returns>
        public static List<Application> GetAll()
        {
            using (DataStoreDataContext ctx = new DataStoreDataContext())
            {
                return ctx.Applications.ToList();
            }
        }
    }
}