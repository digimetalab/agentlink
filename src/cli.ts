import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';
import { AgentLink } from './AgentLink';
import { MCPServerConfig } from './schema/mcp.schema';

const program = new Command();
const agentLink = new AgentLink();

program
  .name('agentlink')
  .description('Universal MCP config sync for AI coding agents')
  .version('0.1.0');

program.command('init')
  .description('Scaffold agentlink.json in cwd with smart defaults')
  .action(async () => {
    const spinner = ora('Initializing agentlink.json...').start();
    try {
      await agentLink.init();
      spinner.succeed(chalk.green('Successfully created agentlink.json!'));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('sync')
  .description('Sync agentlink.json to all detected agents')
  .option('--agents <agents>', 'Comma-separated list of agents to sync (e.g., claude,gemini)')
  .option('--dry-run', 'Show what would be synced without making changes')
  .action(async (options) => {
    const spinner = ora('Syncing config...').start();
    try {
      const agents = options.agents ? options.agents.split(',').map((a: string) => a.trim()) : undefined;
      const result = await agentLink.sync({ agents, dryRun: options.dryRun });
      spinner.succeed(chalk.green('Sync complete!'));
      
      if (result.synced.length > 0) {
        console.log(chalk.green(`\nSynced to: ${result.synced.join(', ')}`));
      }
      if (result.failed.length > 0) {
        console.log(chalk.red(`Failed to sync: ${result.failed.join(', ')}`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('add <server-name>')
  .description('Prompt for config, add to agentlink.json and sync')
  .option('--command <cmd>', 'Command to run')
  .option('--args <args>', 'Comma-separated arguments')
  .action(async (name, options) => {
    const spinner = ora(`Adding server '${name}'...`).start();
    try {
      if (!options.command) throw new Error('--command is required');
      const config: MCPServerConfig = { command: options.command };
      if (options.args) config.args = options.args.split(',').map((a: string) => a.trim());
      
      await agentLink.addServer(name, config);
      await agentLink.sync();
      spinner.succeed(chalk.green(`Server '${name}' added and synced!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('remove <server-name>')
  .description('Remove MCP server and sync')
  .action(async (name) => {
    const spinner = ora(`Removing server '${name}'...`).start();
    try {
      await agentLink.removeServer(name);
      await agentLink.sync();
      spinner.succeed(chalk.green(`Server '${name}' removed and synced!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('list')
  .description('List all configured MCP servers in agentlink.json')
  .action(async () => {
    try {
      const servers = await agentLink.listServers();
      const keys = Object.keys(servers);
      if (keys.length === 0) {
        console.log(chalk.yellow('No servers configured in agentlink.json.'));
        return;
      }
      console.log(chalk.cyan('\nConfigured MCP Servers:\n'));
      for (const key of keys) {
        console.log(chalk.green(`- ${key}:`), chalk.dim(servers[key].command));
      }
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('status')
  .description('Show which agents are detected and their config paths')
  .action(async () => {
    try {
      const installed = await agentLink.detectAgents();
      console.log(chalk.cyan('\nDetected Agents:\n'));
      
      const tableData: any = {};
      const allAgents = ['claude', 'gemini', 'codex', 'opencode'];
      const installedNames = installed.map(a => a.name);
      
      for (const agent of allAgents) {
        const isInstalled = installedNames.includes(agent);
        const info = installed.find(a => a.name === agent);
        tableData[agent] = {
          Detected: isInstalled ? chalk.green('Yes') : chalk.red('No'),
          Path: info ? chalk.dim(info.configPath) : chalk.dim('N/A')
        };
      }
      
      console.table(tableData);
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('pull')
  .description('Use an agent\'s existing config as source of truth')
  .requiredOption('--from <agent>', 'Agent name to pull from (e.g., claude)')
  .action(async (options) => {
    const spinner = ora(`Pulling config from ${options.from}...`).start();
    try {
      await agentLink.pull(options.from);
      spinner.succeed(chalk.green(`Successfully pulled config from ${options.from} to agentlink.json!`));
    } catch (err: any) {
      spinner.fail(chalk.red(err.message));
      process.exit(1);
    }
  });

program.command('diff')
  .description('Show config differences between all agents')
  .action(async () => {
    try {
      const diffs = await agentLink.diff();
      let hasChanges = false;
      for (const [agent, diff] of Object.entries(diffs)) {
        if (diff.hasChanges) {
          hasChanges = true;
          console.log(chalk.cyan(`\nDiff for ${agent}:`));
          diff.added.forEach(a => console.log(chalk.green(`+ Added: ${a}`)));
          diff.removed.forEach(r => console.log(chalk.red(`- Removed: ${r}`)));
          diff.modified.forEach(m => console.log(chalk.yellow(`~ Modified: ${m}`)));
        }
      }
      if (!hasChanges) {
        console.log(chalk.green('All agent configs are in sync with agentlink.json!'));
      }
    } catch (err: any) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });


// ---------- REPL LOGIC ----------

const C1_WIDTH = 45;
const C2_WIDTH = 60;
const TOTAL_WIDTH = C1_WIDTH + C2_WIDTH + 5;

function centerPlain(str: string, width: number) {
  const visibleLength = str.replace(/\x1B\[\d+m/g, '').length;
  if (visibleLength >= width) return str;
  const leftPadding = Math.floor((width - visibleLength) / 2);
  const rightPadding = width - visibleLength - leftPadding;
  return ' '.repeat(leftPadding) + str + ' '.repeat(rightPadding);
}

function padRight(str: string, width: number) {
  const visibleLength = str.replace(/\x1B\[\d+m/g, '').length;
  return str + ' '.repeat(Math.max(0, width - visibleLength));
}

async function drawBanner() {
  const installed = await agentLink.detectAgents();
  const installedNames = installed.map(a => a.name);

  const agentsList = [
    { name: 'Claude Code', id: 'claude' },
    { name: 'Gemini CLI', id: 'gemini' },
    { name: 'Codex', id: 'codex' },
    { name: 'OpenCode', id: 'opencode' }
  ];

  const agentLines = agentsList.map(agent => {
    const isInstalled = installedNames.includes(agent.id);
    const icon = isInstalled ? '🟢' : '🔴';
    return `${icon} ${agent.name}`;
  });

  let cwd = process.cwd();
  if (cwd.length > C1_WIDTH - 6) cwd = '...' + cwd.substring(cwd.length - (C1_WIDTH - 9));

  const logo = [
    " █████╗  ██████╗ ███████╗███╗   ██╗████████╗██╗     ██╗███╗   ██╗██╗  ██╗ ",
    "██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██║     ██║████╗  ██║██║ ██╔╝ ",
    "███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██║     ██║██╔██╗ ██║█████╔╝  ",
    "██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║     ██║██║╚██╗██║██╔═██╗  ",
    "██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████╗██║██║ ╚████║██║  ██╗ ",
    "╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ "
  ];

  const c1 = [
    "",
    centerPlain("Welcome back!", C1_WIDTH),
    "",
    "",
    centerPlain("by digimetalab", C1_WIDTH),
    "",
    centerPlain(cwd, C1_WIDTH),
    ""
  ];

  const c2 = [
    "Tips for getting started",
    chalk.dim("Run /init to create agentlink.json in your workspace."),
    chalk.dim("Run /help to see all available sync commands."),
    "────────────────────────────────────────────────────────────",
    "Detected Agents",
    agentLines[0],
    agentLines[1],
    agentLines[2],
    agentLines[3]
  ];

  const bColor = chalk.hex('#9F7AEA').bold;
  const logoColor = chalk.hex('#B794F4').bold;

  // Print top border
  console.log(`${bColor('╭───')} ${chalk.bgHex('#9F7AEA').white.bold(' AgentLink v0.1.0 ')} ${bColor('─'.repeat(TOTAL_WIDTH - 23))}╮`);

  // Print logo full width
  console.log(`${bColor('│')}${centerPlain('', TOTAL_WIDTH)}${bColor('│')}`);
  for (const line of logo) {
    console.log(`${bColor('│')}${logoColor(centerPlain(line, TOTAL_WIDTH))}${bColor('│')}`);
  }
  console.log(`${bColor('│')}${centerPlain('', TOTAL_WIDTH)}${bColor('│')}`);
  
  // Print divider connecting left and right columns
  console.log(bColor('├' + '─'.repeat(C1_WIDTH + 2) + '┬' + '─'.repeat(C2_WIDTH + 2) + '┤'));

  // Print columns
  for (let i = 0; i < 9; i++) {
    const leftText = c1[i] || "";
    const rightText = c2[i] || "";
    
    let coloredLeft = padRight(leftText, C1_WIDTH);
    if (i === 4) coloredLeft = chalk.dim.italic(coloredLeft);
    
    let coloredRight = padRight(rightText, C2_WIDTH);
    if (i === 3) coloredRight = bColor(coloredRight);

    console.log(`${bColor('│')} ${coloredLeft} ${bColor('│')} ${coloredRight} ${bColor('│')}`);
  }

  // Print bottom border
  console.log(bColor('╰' + '─'.repeat(C1_WIDTH + 2) + '┴' + '─'.repeat(C2_WIDTH + 2) + '╯'));
  console.log();
}

async function startREPL() {
  await drawBanner();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.magenta.bold('agentlink> ')
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    const args = input.split(' ').filter(Boolean);
    const cmd = args[0].toLowerCase();

    try {
      switch (cmd) {
        case '/init': {
          const spinnerInit = ora('Initializing...').start();
          try {
            await agentLink.init();
            spinnerInit.succeed(chalk.green('Successfully created agentlink.json!'));
          } catch (e: any) { spinnerInit.fail(chalk.red(e.message)); }
          break;
        }
          
        case '/sync': {
          const spinnerSync = ora('Syncing...').start();
          try {
            const agents = args.length > 1 ? args.slice(1) : undefined;
            const result = await agentLink.sync({ agents });
            spinnerSync.succeed(chalk.green('Sync complete!'));
            if (result.synced.length > 0) console.log(chalk.green(`Synced to: ${result.synced.join(', ')}`));
            if (result.failed.length > 0) console.log(chalk.red(`Failed to sync: ${result.failed.join(', ')}`));
          } catch (e: any) { spinnerSync.fail(chalk.red(e.message)); }
          break;
        }

        case '/list': {
          const servers = await agentLink.listServers();
          if (Object.keys(servers).length === 0) {
            console.log(chalk.yellow('No servers configured.'));
          } else {
            for (const [key, val] of Object.entries(servers)) {
              console.log(chalk.green(`- ${key}:`), chalk.dim(val.command));
            }
          }
          break;
        }

        case '/status': {
          const installed = await agentLink.detectAgents();
          console.log(chalk.cyan('Detected Agents:'));
          installed.forEach(a => console.log(chalk.green(`- ${a.name} `) + chalk.dim(`(${a.configPath})`)));
          break;
        }

        case '/diff': {
          const diffs = await agentLink.diff();
          for (const [agent, diff] of Object.entries(diffs)) {
            if (diff.hasChanges) {
              console.log(chalk.cyan(`\nDiff for ${agent}:`));
              diff.added.forEach(a => console.log(chalk.green(`+ Added: ${a}`)));
              diff.removed.forEach(r => console.log(chalk.red(`- Removed: ${r}`)));
              diff.modified.forEach(m => console.log(chalk.yellow(`~ Modified: ${m}`)));
            }
          }
          break;
        }
        
        case '/add': {
          if (args.length < 3) {
            console.log(chalk.red('Usage: /add <server-name> <command> [args...]'));
            break;
          }
          const name = args[1];
          const command = args[2];
          const cmdArgs = args.slice(3);
          const spinnerAdd = ora(`Adding server '${name}'...`).start();
          try {
            const config: MCPServerConfig = { command };
            if (cmdArgs.length > 0) config.args = cmdArgs;
            await agentLink.addServer(name, config);
            await agentLink.sync();
            spinnerAdd.succeed(chalk.green(`Server '${name}' added and synced!`));
          } catch (e: any) { spinnerAdd.fail(chalk.red(e.message)); }
          break;
        }

        case '/remove': {
          if (args.length < 2) {
            console.log(chalk.red('Usage: /remove <server-name>'));
            break;
          }
          const name = args[1];
          const spinnerRm = ora(`Removing server '${name}'...`).start();
          try {
            await agentLink.removeServer(name);
            await agentLink.sync();
            spinnerRm.succeed(chalk.green(`Server '${name}' removed and synced!`));
          } catch (e: any) { spinnerRm.fail(chalk.red(e.message)); }
          break;
        }

        case '/pull': {
          if (args.length < 2) {
            console.log(chalk.red('Usage: /pull <agent>'));
            break;
          }
          const agent = args[1];
          const spinnerPull = ora(`Pulling from '${agent}'...`).start();
          try {
            await agentLink.pull(agent);
            spinnerPull.succeed(chalk.green(`Successfully pulled config from ${agent}!`));
          } catch (e: any) { spinnerPull.fail(chalk.red(e.message)); }
          break;
        }

        case '/exit':
        case '/quit':
          rl.close();
          return;

        case '/help':
          console.log(chalk.cyan('Available Commands:'));
          console.log(`  ${chalk.magenta('/init')}                               Initialize agentlink.json`);
          console.log(`  ${chalk.magenta('/sync [agents...]')}                   Sync to all or specific agents`);
          console.log(`  ${chalk.magenta('/add <server> <command> [args...]')}   Add a new server and sync`);
          console.log(`  ${chalk.magenta('/remove <server>')}                    Remove a server and sync`);
          console.log(`  ${chalk.magenta('/pull <agent>')}                       Pull config from a specific agent`);
          console.log(`  ${chalk.magenta('/list')}                               List configured MCP servers`);
          console.log(`  ${chalk.magenta('/status')}                             Show detected agents`);
          console.log(`  ${chalk.magenta('/diff')}                               Show configuration differences`);
          console.log(`  ${chalk.magenta('/help')}                               Show this help menu`);
          console.log(`  ${chalk.magenta('/exit')}                               Close agentlink`);
          break;

        default:
          console.log(chalk.red(`Unknown command: ${cmd}. Type /help for available commands.`));
      }
    } catch (err: any) {
      console.log(chalk.red(`Error: ${err.message}`));
    }

    console.log();
    rl.prompt();
  }).on('close', () => {
    console.log(chalk.magenta('Goodbye!'));
    process.exit(0);
  });
}

if (process.argv.length <= 2) {
  startREPL();
} else {
  program.parse(process.argv);
}
